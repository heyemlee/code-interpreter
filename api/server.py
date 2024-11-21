import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain.agents import AgentType, create_react_agent, AgentExecutor
from langchain_experimental.agents.agent_toolkits.python.base import create_python_agent
from langchain_openai import ChatOpenAI
from langchain_experimental.tools.python.tool import PythonAstREPLTool
from langchain_experimental.agents import create_csv_agent
from langchain_core.tools import Tool
from langchain import hub
import qrcode
import base64
from io import BytesIO

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Get the absolute path of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Build the absolute path to the CSV file
CSV_PATH = os.path.join(BASE_DIR, '..', 'episode-info.csv')

# Ensure the file exists
if not os.path.exists(CSV_PATH):
    print(f"Warning: CSV file not found at {CSV_PATH}")

class CustomPythonREPLTool(PythonAstREPLTool):
    def __init__(self):
        super().__init__()
        self.locals.update({"qrcode": qrcode, "BytesIO": BytesIO, "base64": base64})

        def create_ascii_qr(text):
            qr = qrcode.QRCode()
            qr.add_data(text)
            qr.make()
            return qr.print_ascii(invert=True)

        self.locals["create_ascii_qr"] = create_ascii_qr

# Initialize agents
python_llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo")
python_agent_executor = create_python_agent(
    llm=python_llm,
    tool=CustomPythonREPLTool(),
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)

csv_llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo")
csv_agent = create_csv_agent(
    llm=csv_llm,
    path=CSV_PATH,  # Use the absolute path
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    allow_dangerous_code=True,
    verbose=True,
)

# Define tools for router agent
tools = [
    Tool(
        name="PythonAgent",
        func=python_agent_executor.invoke,
        description="""Useful when you need to transform natural language and write from it python and execute the python code,
                      returning the results of the code execution. Can generate ASCII QR codes using create_ascii_qr() function.""",
    ),
    Tool(
        name="CSVAgent",
        func=csv_agent.invoke,
        description="""Useful when you need to answer question over episode-info.csv file,
                     takes an input the entire question and returns the answer after running pandas calculations""",
    ),
]

# Initialize router agent
router_llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo")
prompt = hub.pull("hwchase17/react")
router_agent = create_react_agent(router_llm, tools, prompt)

# Create agent executor
agent_executor = AgentExecutor(agent=router_agent, tools=tools, verbose=True)

@app.route("/api/python", methods=["POST"])
def execute_python():
    try:
        data = request.json
        code = data.get("code")
        if not code:
            return jsonify({"error": "No code provided"}), 400

        result = python_agent_executor.invoke({"input": code})
        return jsonify({"result": str(result["output"])})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/csv", methods=["POST"])
def analyze_csv():
    try:
        data = request.json
        query = data.get("query")
        if not query:
            return jsonify({"error": "No query provided"}), 400

        result = csv_agent.invoke({"input": query})
        return jsonify({"result": str(result["output"])})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/router", methods=["POST"])
def route_query():
    try:
        data = request.json
        query = data.get("query")
        if not query:
            return jsonify({"error": "No query provided"}), 400

        result = agent_executor.invoke({"input": query})
        return jsonify({"result": str(result["output"])})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)