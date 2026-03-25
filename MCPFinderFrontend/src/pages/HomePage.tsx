import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white/60 backdrop-blur-xl border-b border-gray-200/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          MCP Finder
        </h1>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="text-gray-700 hover:text-purple-600"
          >
            Log in
          </Button>
          <Button
            onClick={() => navigate("/signup")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-md"
          >
            Sign up
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-8 shadow-lg">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>

        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-5">
          Discover MCP Servers & Tools
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mb-10">
          An AI-powered chatbot that helps you find, explore, and understand
          Model Context Protocol servers and tools through natural conversation.
        </p>

        <Button
          onClick={() => navigate("/signup")}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-10 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Get Started
        </Button>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
            title: "MCP Discovery",
            desc: "Search and find publicly available MCP servers for any use case.",
          },
          {
            icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
            title: "Smart Recommendations",
            desc: "Get AI-powered suggestions based on your specific requirements.",
          },
          {
            icon: "M13 10V3L4 14h7v7l9-11h-7z",
            title: "Real-time Search",
            desc: "Live web search to find the latest MCP servers and documentation.",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mb-5">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={f.icon}
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {f.title}
            </h3>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
