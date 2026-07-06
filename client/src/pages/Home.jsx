import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import colors from "../theme";
import { useAuth } from "../AuthContext";
import { historyRequest } from "../api";

function ActionCard({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        backgroundColor: colors.bgCard,
        border: "none",
        borderRadius: 12,
        padding: 20,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: colors.purple,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.textWhite,
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: colors.textWhite }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: colors.textGray }}>{subtitle}</div>
    </button>
  );
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

export default function Home() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    historyRequest(token)
      .then(({ history }) => setHistory(history))
      .catch(() => setError("Could not load your quiz history"))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgPage }}>
      <Navbar />

      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          <ActionCard
            icon="+"
            title="Create Quiz"
            subtitle="Build a new quiz"
            onClick={() => navigate("/create-quiz")}
          />
          <ActionCard
            icon="→"
            title="Join Quiz"
            subtitle="Enter a room code to play"
            onClick={() => navigate("/join")}
          />
        </div>

        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: colors.textWhite,
            marginBottom: 12,
          }}
        >
          Recent Quizzes
        </h2>

        {isLoading && (
          <p style={{ fontSize: 13, color: colors.textGray }}>Loading...</p>
        )}
        {error && (
          <p style={{ fontSize: 13, color: colors.red }}>{error}</p>
        )}
        {!isLoading && !error && history.length === 0 && (
          <p style={{ fontSize: 13, color: colors.textGray }}>
            No quizzes yet — create one or join a room to get started.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {history.map((entry) => (
            <div
              key={entry.sessionId}
              style={{
                backgroundColor: colors.bgCard,
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div
                style={{ fontSize: 13, fontWeight: 700, color: colors.textWhite }}
              >
                {entry.title}
              </div>
              <div style={{ fontSize: 11, color: colors.textGray, margin: "4px 0 6px" }}>
                {formatDate(entry.finishedAt)}
              </div>
              <div style={{ fontSize: 11, color: colors.textGray, marginBottom: 8 }}>
                {entry.role === "organizer" ? "You hosted this" : "You played this"}
              </div>
              <div
                style={{ fontSize: 13, fontWeight: 700, color: colors.purpleLight }}
              >
                {entry.role === "organizer"
                  ? `${entry.participantCount} player${entry.participantCount === 1 ? "" : "s"}`
                  : `${entry.score} pts`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
