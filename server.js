const express = require('express');
const app = express();
const path = require('path');
const { Pool } = require('pg');  // PostgreSQL client

// Set up PostgreSQL connection using the connection string from the environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json()); // To parse JSON bodies

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

// Serve static HTML files
app.use(express.static('public'));

// Set up server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
