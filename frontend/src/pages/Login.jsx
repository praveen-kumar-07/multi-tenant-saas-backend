import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { setAuth } from "../auth/auth";

export default function Login() {
  const [tenantSubdomain, setTenantSubdomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    if (!tenantSubdomain || !email || !password) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest("/auth/login", "POST", {
        tenantSubdomain,
        email,
        password,
      });

      setAuth(res.data);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <form style={card} onSubmit={handleLogin}>
        <h1>Welcome Back 👋</h1>
        <p style={{ opacity: 0.7 }}>Login to your tenant workspace</p>

        <input
          value={tenantSubdomain}
          onChange={(e) => setTenantSubdomain(e.target.value)}
          placeholder="Tenant Subdomain"
          required
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
        />

        <button style={{ width: "100%" }} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

const page = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const card = {
  width: "380px",
  padding: "32px",
  background: "white",
  borderRadius: "14px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
};
