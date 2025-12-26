import Layout from "../components/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <h2>Dashboard</h2>
      <div style={grid}>
        <Stat title="Users" value="Active" />
        <Stat title="Projects" value="Ongoing" />
        <Stat title="Tasks" value="In Progress" />
      </div>
    </Layout>
  );
}

function Stat({ title, value }) {
  return (
    <div style={stat}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "20px",
};

const stat = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};
