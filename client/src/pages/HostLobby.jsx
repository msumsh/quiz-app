import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import colors from "../theme";
import { socket } from "../socket";

export default function HostLobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const quiz = location.state?.quiz;

  const [roomCode, setRoomCode] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quiz) {
      navigate("/create-quiz", { replace: true });
      return;
    }

    socket.emit("host:create_room", quiz, (res) => {
      if (res?.ok) {
        setRoomCode(res.roomCode);
      } else {
        setError(res?.error || "Could not create the room");
      }
    });

    const handleParticipantsUpdate = (list) => setParticipants(list);
    socket.on("room:participants_update", handleParticipantsUpdate);

    return () => {
      socket.off("room:participants_update", handleParticipantsUpdate);
    };
  }, []);

  const handleStartQuiz = () => {
    navigate("/quiz/active", { state: { roomCode, role: "host", shouldStart: true } });
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
            {roomCode || "------"}
          </div>
          {error && (
            <div style={{ fontSize: 12, color: colors.red, marginTop: 8 }}>
              {error}
            </div>
          )}
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
            {participants.length === 0 && (
              <span style={{ fontSize: 12, color: colors.textGray }}>
                Waiting for players to join...
              </span>
            )}
            {participants.map((p) => (
              <div
                key={p.id}
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
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartQuiz}
          disabled={!roomCode || participants.length === 0}
          style={{
            ...startButtonStyle,
            opacity: !roomCode || participants.length === 0 ? 0.5 : 1,
            cursor: !roomCode || participants.length === 0 ? "not-allowed" : "pointer",
          }}
        >
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