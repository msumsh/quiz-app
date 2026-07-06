import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import ErrorBoundary from "./ErrorBoundary";

import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import CreateQuiz from "./pages/CreateQuiz.jsx";
import QuestionEditor from "./pages/QuestionEditor.jsx";
import HostLobby from "./pages/HostLobby.jsx";
import JoinQuiz from "./pages/JoinQuiz.jsx";
import ActiveQuestion from "./pages/ActiveQuestion.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";

function RequireAuth({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/home"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />

            <Route
              path="/create-quiz"
              element={
                <RequireAuth>
                  <CreateQuiz />
                </RequireAuth>
              }
            />
            <Route
              path="/create-quiz/questions"
              element={
                <RequireAuth>
                  <QuestionEditor />
                </RequireAuth>
              }
            />
            <Route
              path="/lobby"
              element={
                <RequireAuth>
                  <HostLobby />
                </RequireAuth>
              }
            />

            <Route
              path="/join"
              element={
                <RequireAuth>
                  <JoinQuiz />
                </RequireAuth>
              }
            />

            <Route
              path="/quiz/active"
              element={
                <RequireAuth>
                  <ActiveQuestion />
                </RequireAuth>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <RequireAuth>
                  <Leaderboard />
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
