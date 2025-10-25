import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await axios.post(`${API}/auth/google`, {
        token: credentialResponse.credential,
      });

      const { access_token, user } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Welcome, ${user.name}!`);
      onLogin();
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md px-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              MCP Server Finder
            </h1>
            <p className="text-gray-600 text-lg">
              Discover the best MCP servers and tools
            </p>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <p className="text-gray-500 text-sm">
              Sign in to discover MCP servers and tools
            </p>
            <div data-testid="google-login-button">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="pill"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <span>🔍 MCP Discovery</span>
              <span>•</span>
              <span>🛠️ Tool Recommendations</span>
              <span>•</span>
              <span>⚡ Real-time Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;