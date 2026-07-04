import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import colors from "../theme";

const recentQuizzes = [
  { id: 4, title: "Quiz 4", date: "July 01, 2026", score: "9/10" },
  { id: 3, title: "Quiz 3", date: "March 27, 2026", score: "6/10" },
  { id: 2, title: "Quiz 2", date: "December 14, 2025", score: "8/10" },
  { id: 1, title: "Quiz 1", date: "November 02, 2025", score: "4/10" },
];

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

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgPage }}>
      <Navbar />

      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        {/* Create / Join cards */}
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

        {/* Recent quizzes */}
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {recentQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              style={{
                backgroundColor: colors.bgCard,
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div
                style={{ fontSize: 13, fontWeight: 700, color: colors.textWhite }}
              >
                {quiz.title}
              </div>
              <div style={{ fontSize: 11, color: colors.textGray, margin: "4px 0 10px" }}>
                {quiz.date}
              </div>
              <div
                style={{ fontSize: 13, fontWeight: 700, color: colors.purpleLight }}
              >
                {quiz.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
