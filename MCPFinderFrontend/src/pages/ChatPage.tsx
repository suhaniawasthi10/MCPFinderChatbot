import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

interface User {
  id: string;
  name: string;
  username: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatPageProps {
  onLogout: () => void;
}

const ChatPage = ({ onLogout }: ChatPageProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [typingText, setTypingText] = useState("");
  const [toolStatus, setToolStatus] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const response = await axios.get(`${API}/conversations`, {
        headers: getAuthHeaders(),
      });
      setConversations(response.data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await axios.get(
        `${API}/conversations/${conversationId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      setMessages(response.data);
      setCurrentConversation(conversationId);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load conversation");
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setTypingText("");
    setToolStatus("");
  };

  const getToolDisplayName = (toolName: string): string => {
    const toolMap: { [key: string]: string } = {
      "search_mcp_servers": "🔎 Searching MCP servers",
      "search_web": "🌐 Browsing the web",
    };
    return toolMap[toolName] || `🔧 Using ${toolName}`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage;
    setInputMessage("");
    setIsLoading(true);
    setTypingText("");
    setToolStatus("");

    // Add user message to UI immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageText,
          conversation_id: currentConversation,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let aiResponse = "";
      let newConversationId = currentConversation;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Split by double newline (SSE format)
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (!part.trim()) continue;

            const lines = part.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === "tool_start") {
                    // Show tool usage status
                    setToolStatus(getToolDisplayName(data.tool));
                  } else if (data.type === "tool_end") {
                    // Clear tool status when tool completes
                    setToolStatus("");
                  } else if (data.type === "response") {
                    // Got the final response
                    aiResponse = data.content;
                    if (data.conversation_id) {
                      newConversationId = data.conversation_id;
                      setCurrentConversation(data.conversation_id);
                    }
                  } else if (data.type === "error") {
                    toast.error(data.message);
                  }
                } catch (e) {
                  console.error("Failed to parse SSE data:", e);
                }
              }
            }
          }
        }
      }

      // Clear tool status
      setToolStatus("");

      // Simulate typing effect word by word
      if (aiResponse) {
        let currentText = "";
        const words = aiResponse.split(" ");
        
        for (let i = 0; i < words.length; i++) {
          currentText += (i === 0 ? "" : " ") + words[i];
          setTypingText(currentText);
          
          // Fast typing speed (15-35ms per word)
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 20 + 15));
        }

        // Add the complete AI message to messages
        const aiMsg: Message = {
          id: Date.now().toString(),
          sender: "ai",
          content: aiResponse,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setTypingText("");
      }

      // Reload conversations to update the list
      await loadConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setToolStatus("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    onLogout();
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/conversations/${conversationId}`, {
        headers: getAuthHeaders(),
      });
      toast.success("Conversation deleted");
      await loadConversations();
      if (currentConversation === conversationId) {
        startNewConversation();
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 ease-in-out bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col shadow-lg overflow-hidden`}
      >
        {isSidebarOpen && (
          <>
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                MCP Finder
              </h2>
              <p className="text-sm text-gray-600">AI-Powered MCP Search</p>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <Button
                onClick={startNewConversation}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Chat
              </Button>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-2 py-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      currentConversation === conv.id
                        ? "bg-gradient-to-r from-purple-100 to-blue-100 shadow-md"
                        : "hover:bg-gray-100/70"
                    }`}
                    onClick={() => loadMessages(conv.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conv.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conv.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv.id, e)}
                        className="ml-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 transition-all duration-200"
                        title="Delete conversation"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-purple-100">
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-white">
                      {user?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      @{user?.username}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-200/50"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-gray-100/70"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
            <h1 className="text-xl font-semibold text-gray-800">
              {currentConversation ? "Chat" : "New Conversation"}
            </h1>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && !typingText && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-6">
                  <svg
                    className="w-10 h-10 text-purple-600"
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
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Start a Conversation
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Ask me anything about MCP servers, tools, or integrations!
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-3xl rounded-br-md shadow-md"
                      : "bg-white/70 backdrop-blur-sm text-gray-800 rounded-3xl rounded-bl-md shadow-sm border border-gray-200/50"
                  } px-6 py-4`}
                >
                  {message.sender === "ai" ? (
                    <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-purple-600 prose-pre:bg-gray-100 prose-pre:text-gray-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-base whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === "user"
                        ? "text-purple-100"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Animation */}
            {typingText && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-white/70 backdrop-blur-sm text-gray-800 rounded-3xl rounded-bl-md shadow-sm border border-gray-200/50 px-6 py-4">
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-purple-600 prose-pre:bg-gray-100 prose-pre:text-gray-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {typingText}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
                    <span className="text-xs text-gray-500">typing...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator with Tool Status */}
            {isLoading && !typingText && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-white/70 backdrop-blur-sm text-gray-800 rounded-3xl rounded-bl-md shadow-sm border border-gray-200/50 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                    <span className="text-sm text-gray-500 ml-2">
                      {toolStatus || "🤔 AI is thinking..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-200/50 bg-white/80 backdrop-blur-xl p-6">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex space-x-4"
            >
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about MCP servers..."
                disabled={isLoading}
                className="flex-1 bg-white/70 border-gray-300/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-2xl px-6 py-6 text-base shadow-sm"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
