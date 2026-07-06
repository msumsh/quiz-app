import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import colors from "../theme";

function Input({ label, id, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
      <label
        htmlFor={id}
        style={{ fontSize: 12, color: colors.textGray, marginBottom: 6 }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        style={{
          backgroundColor: colors.bgInput,
          border: `1px solid ${colors.borderInput}`,
          borderRadius: 8,
          padding: "10px 12px",
          color: colors.textWhite,
          fontSize: 14,
          outline: "none",
        }}
      />
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (registerPassword !== registerConfirm) {
      setError("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        email: registerEmail,
        password: registerPassword,
        name: registerUsername,
      });
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabButtonStyle = (isActive) => ({
    flex: 1,
    border: "none",
    background: isActive ? colors.purple : "transparent",
    color: isActive ? colors.textWhite : colors.textGray,
    fontSize: 14,
    fontWeight: 600,
    padding: "8px 0",
    borderRadius: 24,
    cursor: "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease",
  });

  const submitButtonStyle = {
    marginTop: 20,
    padding: "12px 0",
    border: "none",
    borderRadius: 8,
    backgroundColor: colors.purple,
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    opacity: isSubmitting ? 0.7 : 1,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 20,
        backgroundColor: colors.bgPage,
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: 2,
          color: colors.textWhite,
          margin: 0,
        }}
      >
        QUIZZLY
      </h1>

      <div
        style={{
          width: "100%",
          maxWidth: 340,
          backgroundColor: colors.bgCard,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            backgroundColor: colors.bgInput,
            borderRadius: 20,
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            style={tabButtonStyle(activeTab === "login")}
            onClick={() => {
              setActiveTab("login");
              setError("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            style={tabButtonStyle(activeTab === "register")}
            onClick={() => {
              setActiveTab("register");
              setError("");
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: colors.red, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {activeTab === "login" && (
          <form
            onSubmit={handleLoginSubmit}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Input
              label="Email address"
              id="loginEmail"
              type="email"
              placeholder="Email address"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <Input
              label="Password"
              id="loginPassword"
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <button type="submit" disabled={isSubmitting} style={submitButtonStyle}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        )}

        {activeTab === "register" && (
          <form
            onSubmit={handleRegisterSubmit}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Input
              label="Email address"
              id="registerEmail"
              type="email"
              placeholder="Email address"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
            <Input
              label="Username"
              id="registerUsername"
              type="text"
              placeholder="Username"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
            />
            <Input
              label="Password"
              id="registerPassword"
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <Input
              label="Repeat password"
              id="registerConfirm"
              type="password"
              placeholder="Repeat password"
              value={registerConfirm}
              onChange={(e) => setRegisterConfirm(e.target.value)}
            />

            <button type="submit" disabled={isSubmitting} style={submitButtonStyle}>
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
