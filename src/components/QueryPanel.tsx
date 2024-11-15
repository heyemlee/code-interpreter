import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface QueryPanelProps {
  activeTab: string;
  onSubmit: (query: string) => void;
  loading: boolean;
}

const placeholders = {
  python: 'Enter Python code or natural language query...(Mainly for Generate qrcode and download it to local.)',
  csv: 'Ask questions about the episode-info.csv data...(Only for episode-info.csv)',
  router: 'Enter a query for the router agent...',
};

const QueryPanel: React.FC<QueryPanelProps> = ({ activeTab, onSubmit, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholders[activeTab as keyof typeof placeholders]}
            className="w-full h-32 p-4 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`absolute bottom-4 right-4 p-2 rounded-lg ${
              loading || !query.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default QueryPanel;