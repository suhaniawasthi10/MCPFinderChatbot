import { useState } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TestPage = () => {
  const [testMessage, setTestMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/`);
      setResponse(`✅ Backend connected: ${JSON.stringify(res.data)}`);
    } catch (error: any) {
      setResponse(`❌ Backend error: ${error.message}`);
    }
    setLoading(false);
  };

  const testChat = async () => {
    if (!testMessage.trim()) return;
    
    setLoading(true);
    try {
      // Get a test token (this will fail but we can see the error)
      const res = await axios.post(`${API}/chat`, {
        message: testMessage,
        conversation_id: null
      }, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      setResponse(`✅ Chat response: ${JSON.stringify(res.data)}`);
    } catch (error: any) {
      setResponse(`❌ Chat error: ${error.response?.data?.detail || error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6">MCP Server Finder - Backend Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Backend Connection"}
          </button>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Test Chat (without auth)</h3>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a test message..."
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={testChat}
              disabled={loading || !testMessage.trim()}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Chat"}
            </button>
          </div>

          {response && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Response:</h3>
              <pre className="text-sm whitespace-pre-wrap">{response}</pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Environment Info:</h3>
            <p><strong>Backend URL:</strong> {BACKEND_URL}</p>
            <p><strong>API Endpoint:</strong> {API}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;


