import React, { useState } from 'react';
import { Code2, FileSpreadsheet, Router } from 'lucide-react';
import QueryPanel from './components/QueryPanel';
import ResponsePanel from './components/ResponsePanel';

type Tab = 'python' | 'csv' | 'router';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('python');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleQuery = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/${activeTab}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [activeTab === 'python' ? 'code' : 'query']: query,
        }),
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResponse(data.result);
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Request failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'python' as Tab, icon: Code2, label: 'Python Agent(QR Code Generation)' },
    { id: 'csv' as Tab, icon: FileSpreadsheet, label: 'CSV Agent' },
    { id: 'router' as Tab, icon: Router, label: 'Router Agent' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">LangChain Agent Interface</h1>
          <p className="text-gray-400 text-center">Interact with Python, CSV, and Router Agents</p>
        </header>

        <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-700">
            <nav className="flex">
              {tabs.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 px-6 py-4 focus:outline-none transition-colors ${
                    activeTab === id
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <QueryPanel
              activeTab={activeTab}
              onSubmit={handleQuery}
              loading={loading}
            />
            
            <ResponsePanel
              response={response}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;