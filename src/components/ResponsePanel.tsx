import React from 'react';
import { Loader2 } from 'lucide-react';

interface ResponsePanelProps {
  response: string;
  loading: boolean;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ response, loading }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 min-h-[200px]">
      <h2 className="text-lg font-semibold mb-3 text-gray-300">Response</h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : response ? (
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
          {response}
        </pre>
      ) : (
        <p className="text-gray-500 text-center py-12">
          Submit a query to see the response
        </p>
      )}
    </div>
  );
}

export default ResponsePanel;