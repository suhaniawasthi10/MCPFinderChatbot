import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import TestPage from "./pages/TestPage";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <HomePage />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <LoginPage onLogin={() => setIsAuthenticated(true)} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <SignupPage onLogin={() => setIsAuthenticated(true)} />
              )
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated ? (
                <ChatPage onLogout={() => setIsAuthenticated(false)} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
