require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

/* ✅ BODY PARSER — MUST BE HERE */
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

/* routes */
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/projects', require('./src/routes/projectRoutes'));
app.use('/api/tasks', require('./src/routes/taskRoutes'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: 'connected'
  });
});

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
