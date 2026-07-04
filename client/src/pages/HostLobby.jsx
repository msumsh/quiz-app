import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import colors from "../theme";

const placeholderParticipants = [
  "Player 1",
  "Player 2",
  "Player 3",
  "Player 4",
  "Player 5",
];

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function OrganizerLobby() {
  const navigate = useNavigate();
  const [roomCode] = useState(generateRoomCode());
  const [participants] = useState(placeholderParticipants);

  const handleStartQuiz = () => {
    console.log("Starting quiz for room", roomCode);
    navigate("/quiz/active");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgPage }}>
      <Navbar />

      <div
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: colors.textGray, marginBottom: 6 }}>
            Room Code
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: 8,
              color: colors.textWhite,
            }}
          >
            {roomCode}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 320,
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: colors.textWhite }}>
              Participants
            </span>
            <span
              style={{
                backgroundColor: colors.purple,
                color: colors.textWhite,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 10,
                padding: "2px 8px",
              }}
            >
              {participants.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {participants.map((name) => (
              <div
                key={name}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: colors.purpleLight,
                  }}
                />
                <span style={{ fontSize: 13, color: colors.textWhite }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleStartQuiz} style={startButtonStyle}>
          Start Quiz
        </button>
      </div>
    </div>
  );
}

const startButtonStyle = {
  width: "100%",
  maxWidth: 320,
  padding: "12px 0",
  border: "none",
  borderRadius: 8,
  backgroundColor: colors.purple,
  color: colors.textWhite,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};
