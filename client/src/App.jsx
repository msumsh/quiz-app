import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import CreateQuiz from "./pages/CreateQuiz.jsx";
import QuestionEditor from "./pages/QuestionEditor.jsx";
import HostLobby from "./pages/HostLobby.jsx";
import JoinQuiz from "./pages/JoinQuiz.jsx";
import ActiveQuestion from "./pages/ActiveQuestion.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect the root path straight to the login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />

        {/* Organizer flow: create a quiz, add questions, open the lobby */}
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/create-quiz/questions" element={<QuestionEditor />} />
        <Route path="/lobby" element={<HostLobby />} />

        {/* Participant flow: join with a room code */}
        <Route path="/join" element={<JoinQuiz />} />

        {/* Shared once the quiz is running */}
        <Route path="/quiz/active" element={<ActiveQuestion />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;