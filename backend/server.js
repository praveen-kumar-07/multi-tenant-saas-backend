require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express(); // ✅ MUST BE FIRST

/* ✅ MIDDLEWARE */
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

/* ✅ HEALTH CHECKS */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: 'connected'
  });
});

/* ✅ ROUTES */
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/projects', require('./src/routes/projectRoutes'));
app.use('/api/tasks', require('./src/routes/taskRoutes'));

/* ✅ START SERVER */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
