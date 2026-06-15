import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      if (mode === "login") {
        const res = await api.post("/auth/login", {
          username: form.username,
          password: form.password,
        });

        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("facility", JSON.stringify(res.data.facility));

        onLogin(res.data.facility);
      }

      if (mode === "register") {
        await api.post("/auth/register", {
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
          confirm_password: form.confirm_password,
        });

        setMessage("Account created. You can now log in.");
        setMode("login");
        setForm({
          name: "",
          username: form.username,
          email: "",
          password: "",
          confirm_password: "",
        });
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || "Something went wrong.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>MedTrack</h1>
        <p className="auth-subtitle">Urgent Care Inventory System</p>

        <h2>{mode === "login" ? "Welcome back!" : "Create account"}</h2>
        <p className="auth-helper">
          {mode === "login"
            ? "Please log in to your account."
            : "Register your facility account."}
        </p>

        {message && <div className="notice">{message}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label>Facility Name</label>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />

              <label>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </>
          )}

          <label>{mode === "login" ? "Username" : "Username"}</label>
          <input
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
          />

          {mode === "register" && (
            <>
              <label>Confirm Password</label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={(e) =>
                  updateField("confirm_password", e.target.value)
                }
                required
              />
            </>
          )}

          {mode === "login" && (
            <div className="auth-options">
              <label className="remember-row">
                <input type="checkbox" />
                Remember me
              </label>

              <a
                href="#forgot-password"
                className="forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  setMessage("Forgot password setup is coming next.");
                }}
              >
                Forgot password
              </a>
            </div>
          )}

          <button className="primary" type="submit">
            {mode === "login" ? "Login" : "Create account"}
          </button>

          {mode === "login" && (
            <>
              <div className="auth-divider">
                <span></span>
                <small>or</small>
                <span></span>
              </div>

              <button
                type="button"
                className="secondary full"
                onClick={() => {
                  setMessage("");
                  setMode("register");
                }}
              >
                Create account
              </button>
            </>
          )}

          {mode === "register" && (
            <button
              type="button"
              className="secondary full"
              onClick={() => {
                setMessage("");
                setMode("login");
              }}
            >
              Back to login
            </button>
          )}
        </form>
      </div>
    </main>
  );
}