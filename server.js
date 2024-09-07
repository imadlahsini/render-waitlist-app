const express = require('express');
const app = express();
const path = require('path');
const { Pool } = require('pg');  // PostgreSQL client

// Setup PostgreSQL connection using DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json()); // For parsing application/json

// Serve static files
app.use(express.static('public'));

// API to get the current waitlist from PostgreSQL
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

// API to reset the waitlist at midnight GMT+1
app.post('/api/reset', async (req, res) => {
  try {
    await pool.query('DELETE FROM waitlist');
    res.json({ message: 'Waitlist reset' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Serve the HTML pages
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/display', (req, res) => res.sendFile(path.join(__dirname, 'public', 'display.html')));

// Set up server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
