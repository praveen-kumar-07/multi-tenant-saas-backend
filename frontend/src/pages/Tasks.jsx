import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { apiRequest } from "../api/api";

export default function Tasks() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    apiRequest(`/tasks?projectId=${projectId}`)
      .then(res => setTasks(res.data));
  }, [projectId]);

  return (
    <Layout>
      <h2>Tasks</h2>
      <div style={grid}>
        {tasks.map(t => (
          <div key={t.id} style={card}>
            <strong>{t.title}</strong>
            <p>Status: {t.status}</p>
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
