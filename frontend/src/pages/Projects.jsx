import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { apiRequest } from "../api/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    apiRequest("/projects").then(res => setProjects(res.data));
  }, []);

  return (
    <Layout>
      <h2>Projects</h2>
      <div style={grid}>
        {projects.map(p => (
          <div key={p.id} style={card}>
            <strong>{p.name}</strong>
            <br />
            <Link to={`/tasks/${p.id}`}>View Tasks</Link>
          </div>
        ))}
      </div>
    </Layout>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
  gap: "16px",
};

const card = {
  padding: "16px",
  background: "white",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};
