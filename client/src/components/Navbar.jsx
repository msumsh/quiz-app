import { useNavigate } from "react-router-dom";
import colors from "../theme";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
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
        {user && (
          <span style={{ fontSize: 13, color: colors.textGray }}>{user.name}</span>
        )}
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