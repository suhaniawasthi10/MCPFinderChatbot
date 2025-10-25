import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import TestPage from "./pages/TestPage";
import { Toaster } from "./components/ui/sonner";

const GOOGLE_CLIENT_ID = "765406216563-9d1g6m561t066dar6jdvjj5d1lflmhqq.apps.googleusercontent.com";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/chat" replace />
                ) : (
                  <LoginPage onLogin={() => setIsAuthenticated(true)} />
                )
              }
            />
            <Route
              path="/chat"
              element={
                isAuthenticated ? (
                  <ChatPage onLogout={() => setIsAuthenticated(false)} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/auth/callback"
              element={<Navigate to="/chat" replace />}
            />
            <Route
              path="/test"
              element={<TestPage />}
            />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;