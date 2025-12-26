import { Link, useLocation } from "react-router-dom";
import { logout } from "../auth/auth";

export default function Layout({ children }) {
  const { pathname } = useLocation();

  return (
    <>
      <nav style={nav}>
        <h2 style={{ color: "#4f46e5" }}>Multi-Tenant SaaS</h2>
        <div style={links}>
          <NavLink to="/dashboard" active={pathname==="/dashboard"}>Dashboard</NavLink>
          <NavLink to="/users" active={pathname==="/users"}>Users</NavLink>
          <NavLink to="/projects" active={pathname==="/projects"}>Projects</NavLink>
          <button onClick={() => { logout(); location.href="/login"; }}>
            Logout
          </button>
        </div>
      </nav>

      <main style={main}>{children}</main>
    </>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{
      padding: "8px 14px",
      borderRadius: "6px",
      background: active ? "#eef2ff" : "transparent"
    }}>
      {children}
    </Link>
  );
}

const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 28px",
  background: "white",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const links = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
};

const main = {
  padding: "28px",
};
