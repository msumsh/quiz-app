import { useNavigate } from "react-router-dom";
import colors from "../theme";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: clear auth session once backend is connected
    navigate("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        backgroundColor: colors.bgPanel,
        borderBottom: `1px solid ${colors.borderInput}`,
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: 1.5,
          color: colors.textWhite,
        }}
      >
        QUIZZLY
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: colors.purple,
          }}
        />
        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: `1px solid ${colors.borderInput}`,
            color: colors.textGray,
            fontSize: 12,
            fontWeight: 600,
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
