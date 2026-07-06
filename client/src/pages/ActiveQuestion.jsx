import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import colors from "../theme";
import { socket } from "../socket";

export default function ActiveQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode, role, shouldStart } = location.state || {};

  const [question, setQuestion] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctOptionIndexes, setCorrectOptionIndexes] = useState(null);

  useEffect(() => {
    if (!roomCode) navigate("/home", { replace: true });
  }, [roomCode, navigate]);

  useEffect(() => {
    const handleQuestionShow = (q) => {
      setQuestion(q);
      setSelectedIndexes([]);
      setHasSubmitted(false);
      setCorrectOptionIndexes(null);
      setTimeLeft(q.timeLimitSeconds);
    };

    const handleQuestionResults = ({ correctOptionIndexes }) => {
      setCorrectOptionIndexes(correctOptionIndexes);
    };

    const handleQuizFinished = ({ leaderboard }) => {
      navigate("/leaderboard", { state: { leaderboard } });
    };

    socket.on("question:show", handleQuestionShow);
    socket.on("question:results", handleQuestionResults);
    socket.on("quiz:finished", handleQuizFinished);

    if (role === "host" && shouldStart) {
      socket.emit("host:start_quiz", { roomCode });
    }

    return () => {
      socket.off("question:show", handleQuestionShow);
      socket.off("question:results", handleQuestionResults);
      socket.off("quiz:finished", handleQuizFinished);
    };
  }, [navigate]);

  useEffect(() => {
    if (!question || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [question, timeLeft]);

  const locked = role !== "participant" || hasSubmitted || correctOptionIndexes !== null;

  const submitAnswer = (indexes) => {
    setHasSubmitted(true);
    socket.emit("player:submit_answer", { roomCode, optionIndexes: indexes });
  };

  const handleSingleSelect = (index) => {
    if (locked) return;
    setSelectedIndexes([index]);
    submitAnswer([index]);
  };

  const handleToggleOption = (index) => {
    if (locked) return;
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSubmitMultiple = () => {
    if (locked || selectedIndexes.length === 0) return;
    submitAnswer(selectedIndexes);
  };

  if (!question) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: colors.bgPage }}>
        <Navbar />
        <p style={{ textAlign: "center", color: colors.textGray, marginTop: 60 }}>
          Waiting for the host to start the quiz...
        </p>
      </div>
    );
  }

  const isMultiple = question.answerType === "multiple";

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
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: `2px solid ${colors.purple}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            color: colors.textWhite,
          }}
        >
          {timeLeft}
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: colors.textWhite,
            textAlign: "center",
            maxWidth: 480,
          }}
        >
          {question.text}
        </h1>

        {question.type === "image" && question.imageUrl && (
          <img
            src={question.imageUrl}
            alt=""
            style={{
              maxWidth: "100%",
              maxHeight: 260,
              borderRadius: 12,
            }}
          />
        )}

        {isMultiple && role === "participant" && correctOptionIndexes === null && (
          <p style={{ fontSize: 12, color: colors.textGray }}>
            Select all that apply, then tap Submit
          </p>
        )}
        {role === "host" && (
          <p style={{ fontSize: 12, color: colors.textGray }}>
            You're viewing as the organizer — players are answering now.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            width: "100%",
            maxWidth: 480,
          }}
        >
          {question.options.map((option, index) => {
            const isSelected = selectedIndexes.includes(index);
            const isRevealedCorrect = correctOptionIndexes?.includes(index);
            return (
              <button
                key={option}
                onClick={() =>
                  isMultiple ? handleToggleOption(index) : handleSingleSelect(index)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textAlign: "left",
                  backgroundColor: isRevealedCorrect
                    ? "#2f7d4f"
                    : isSelected
                    ? colors.purple
                    : colors.bgCard,
                  border: `1px solid ${colors.borderInput}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  color: colors.textWhite,
                  fontSize: 13,
                  cursor: role === "participant" ? "pointer" : "default",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: isMultiple ? 3 : "50%",
                    border: `2px solid ${colors.purpleLight}`,
                    backgroundColor: isSelected || isRevealedCorrect ? colors.textWhite : "transparent",
                    flexShrink: 0,
                  }}
                />
                {option}
              </button>
            );
          })}
        </div>

        {isMultiple && role === "participant" && correctOptionIndexes === null && (
          <button
            onClick={handleSubmitMultiple}
            disabled={hasSubmitted || selectedIndexes.length === 0}
            style={{
              padding: "10px 28px",
              border: "none",
              borderRadius: 8,
              backgroundColor: colors.purple,
              color: colors.textWhite,
              fontSize: 14,
              fontWeight: 700,
              cursor: hasSubmitted || selectedIndexes.length === 0 ? "not-allowed" : "pointer",
              opacity: hasSubmitted || selectedIndexes.length === 0 ? 0.5 : 1,
            }}
          >
            {hasSubmitted ? "Submitted" : "Submit"}
          </button>
        )}

        {correctOptionIndexes !== null && (
          <p style={{ fontSize: 12, color: colors.textGray }}>
            Next question coming up...
          </p>
        )}
      </div>
    </div>
  );
}
