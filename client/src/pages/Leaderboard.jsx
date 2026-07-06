import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import colors from "../theme";

const demoResults = [
  { name: "Player 1", score: 78 },
  { name: "Player 2", score: 67 },
  { name: "Player 3", score: 59 },
  { name: "Player 4", score: 43 },
];

const podiumHeight = { 1: 90, 2: 60, 3: 50 };

export default function Leaderboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const leaderboard = location.state?.leaderboard || demoResults;
  const results = leaderboard.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
  const top3 = results.filter((r) => r.rank <= 3);

  const handleBackHome = () => {
    navigate("/home");
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
          gap: 32,
        }}
      >
        {/* Podium */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
          }}
        >
          {top3.map((player) => (
            <div
              key={player.rank}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: colors.purpleLight,
                }}
              />
              <span style={{ fontSize: 12, color: colors.textWhite }}>
                {player.name}
              </span>
              <div
                style={{
                  width: 70,
                  height: podiumHeight[player.rank],
                  backgroundColor:
                    player.rank === 1 ? colors.purple : colors.bgCard,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 800,
                  color: colors.textWhite,
                }}
              >
                {player.rank}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {results.map((player) => (
            <div
              key={player.rank}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: colors.purpleLight,
                    minWidth: 24,
                  }}
                >
                  #{player.rank}
                </span>
                <span style={{ fontSize: 13, color: colors.textWhite }}>
                  {player.name}
                </span>
              </div>
              <span style={{ fontSize: 13, color: colors.textGray }}>
                {player.score} pts
              </span>
            </div>
          ))}
        </div>

        <button onClick={handleBackHome} style={homeButtonStyle}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

const homeButtonStyle = {
  width: "100%",
  maxWidth: 360,
  padding: "12px 0",
  border: "none",
  borderRadius: 8,
  backgroundColor: colors.purple,
  color: colors.textWhite,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};