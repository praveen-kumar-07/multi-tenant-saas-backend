import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiRequest } from "../api/api";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiRequest("/users").then(res => setUsers(res.data));
  }, []);

  return (
    <Layout>
      <h2>Users</h2>
      <div style={grid}>
        {users.map(u => (
          <div key={u.id} style={card}>
            <strong>{u.email}</strong>
            <span style={badge}>{u.role}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
  gap: "20px",
};

const card = {
  background: "white",
  padding: "18px",
  borderRadius: "12px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
  display: "flex",
  justifyContent: "space-between",
};

const badge = {
  background: "#dcfce7",
  color: "#166534",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
};
