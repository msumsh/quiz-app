import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import colors from "../theme";

function Stepper({ label, value, onChange, min = 1, step = 1, unit = "" }) {
  return (
    <div style={{ flex: 1 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          color: colors.textGray,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: colors.bgInput,
          border: `1px solid ${colors.borderInput}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          style={arrowButtonStyle}
        >
          ‹
        </button>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: colors.textWhite,
            fontSize: 14,
          }}
        >
          {value}
          {unit}
        </div>
        <button
          type="button"
          onClick={() => onChange(value + step)}
          style={arrowButtonStyle}
        >
          ›
        </button>
      </div>
    </div>
  );
}

const arrowButtonStyle = {
  background: "transparent",
  border: "none",
  color: colors.purpleLight,
  fontSize: 16,
  padding: "8px 12px",
  cursor: "pointer",
};

export default function CreateQuiz() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);

  const handleNext = (e) => {
    e.preventDefault();
    navigate("/create-quiz/questions", {
      state: { title, category, numQuestions, timeLimit },
    });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgPage }}>
      <Navbar />

      <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
        <form
          onSubmit={handleNext}
          style={{
            width: "100%",
            maxWidth: 420,
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: colors.textGray,
                marginBottom: 6,
              }}
            >
              Quiz Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ancient Greece History"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: colors.textGray,
                marginBottom: 6,
              }}
            >
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{ ...inputStyle, color: category ? colors.textWhite : colors.textGray }}
            >
              <option value="" disabled>
                e.g. History
              </option>
              <option value="history">History</option>
              <option value="science">Science</option>
              <option value="geography">Geography</option>
              <option value="movies">Movies &amp; TV</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Stepper
              label="Number of Questions"
              value={numQuestions}
              onChange={setNumQuestions}
              min={1}
            />
            <Stepper
              label="Time Limit per Question"
              value={timeLimit}
              onChange={setTimeLimit}
              min={5}
              step={5}
              unit="s"
            />
          </div>

          <button type="submit" style={submitButtonStyle}>
            Next: Add Questions
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  backgroundColor: colors.bgInput,
  border: `1px solid ${colors.borderInput}`,
  borderRadius: 8,
  padding: "10px 12px",
  color: colors.textWhite,
  fontSize: 14,
  outline: "none",
};

const submitButtonStyle = {
  marginTop: 8,
  padding: "12px 0",
  border: "none",
  borderRadius: 8,
  backgroundColor: colors.purple,
  color: colors.textWhite,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};