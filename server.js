const express = require('express');
const app = express();
const path = require('path');
const { Pool } = require('pg');

// PostgreSQL setup: Connect to the database using the environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json()); // To parse JSON request bodies

// Serve static files from the "public" folder
app.use(express.static('public'));

// Serve the dashboard page when someone visits "/dashboard"
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve the display page when someone visits "/display" (optional)
app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

// API to fetch the current waitlist from PostgreSQL
app.get('/api/waitlist', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM waitlist ORDER BY time ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API to add a customer to the waitlist
app.post('/api/waitlist', async (req, res) => {
  const { name, time, type } = req.body;
  try {
    await pool.query('INSERT INTO waitlist (name, time, type) VALUES ($1, $2, $3)', [name, time, type]);
    const result = await pool.query('SELECT * FROM waitlist ORDER BY time ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API to remove a customer from the waitlist
app.delete('/api/waitlist/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM waitlist WHERE id = $1', [id]);
    const result = await pool.query('SELECT * FROM waitlist ORDER BY time ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start the server on port 3000 or the port provided by Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
