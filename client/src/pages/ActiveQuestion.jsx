import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import colors from "../theme";

const TIME_PER_QUESTION = 15;

const demoQuestions = [
  {
    text: "Which ancient wonder was located in Egypt?",
    options: [
      "Hanging Gardens of Babylon",
      "Great Pyramid of Giza",
      "Colossus of Rhodes",
      "Lighthouse of Alexandria",
    ],
  },
  {
    text: "Who was the first Roman Emperor?",
    options: ["Julius Caesar", "Nero", "Augustus", "Constantine"],
  },
  {
    text: "In which city was the first Olympic Games held?",
    options: ["Athens", "Sparta", "Olympia", "Corinth"],
  },
];

export default function ActiveQuestion() {
  const navigate = useNavigate();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selected, setSelected] = useState(null);

  const question = demoQuestions[questionIndex];

  useEffect(() => {
    if (timeLeft <= 0) {
      goToNext();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const goToNext = () => {
    if (questionIndex < demoQuestions.length - 1) {
      setQuestionIndex((i) => i + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setSelected(null);
    } else {
      navigate("/leaderboard");
    }
  };

  const handleSelect = (index) => {
    if (selected !== null) return;
    setSelected(index);
    setTimeout(goToNext, 800);
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
        {/* Timer circle */}
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
            const isSelected = selected === index;
            return (
              <button
                key={option}
                onClick={() => handleSelect(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textAlign: "left",
                  backgroundColor: isSelected ? colors.purple : colors.bgCard,
                  border: `1px solid ${colors.borderInput}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  color: colors.textWhite,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: `2px solid ${colors.purpleLight}`,
                    backgroundColor: isSelected ? colors.textWhite : "transparent",
                    flexShrink: 0,
                  }}
                />
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
