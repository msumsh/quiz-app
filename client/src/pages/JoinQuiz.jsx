import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import colors from "../theme";

const CODE_LENGTH = 6;

export default function JoinQuiz() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, CODE_LENGTH);
    setCode(value);
    setError("");
  };

  const handleJoin = (e) => {
    e.preventDefault();

    if (code.length < CODE_LENGTH) {
      setError("Enter the full room code");
      return;
    }

    console.log("Joining room", code);
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
          justifyContent: "center",
          minHeight: "70vh",
          gap: 24,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textWhite }}>
          Room Code
        </h1>

        <form
          onSubmit={handleJoin}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: "100%",
            maxWidth: 320,
          }}
        >
          <input
            value={code}
            onChange={handleChange}
            placeholder={"-".repeat(CODE_LENGTH)}
            maxLength={CODE_LENGTH}
            style={{
              width: "100%",
              textAlign: "center",
              letterSpacing: 10,
              fontSize: 20,
              fontWeight: 700,
              backgroundColor: colors.bgInput,
              border: `1px solid ${colors.borderInput}`,
              borderRadius: 8,
              padding: "12px 0",
              color: colors.textWhite,
              outline: "none",
            }}
          />

          {error && (
            <span style={{ fontSize: 12, color: colors.red }}>{error}</span>
          )}

          <button type="submit" style={joinButtonStyle}>
            Join
          </button>
        </form>
      </div>
    </div>
  );
}

const joinButtonStyle = {
  width: "100%",
  padding: "12px 0",
  border: "none",
  borderRadius: 8,
  backgroundColor: colors.purple,
  color: colors.textWhite,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};
