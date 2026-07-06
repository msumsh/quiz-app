import { Component } from "react";
import colors from "./theme";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/home";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          backgroundColor: colors.bgPage,
          color: colors.textWhite,
          fontFamily: "'Segoe UI', Arial, sans-serif",
          padding: 20,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Something went wrong</h1>
        <p style={{ fontSize: 14, color: colors.textGray, maxWidth: 360 }}>
          This page hit an unexpected error. Your quiz data and login are
          safe — try going back to the home page.
        </p>
        <button
          onClick={this.handleReload}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: 8,
            backgroundColor: colors.purple,
            color: colors.textWhite,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }
}
