const express = require('express');
const app = express();
const path = require('path');

// In-memory storage to store the waitlist
let waitlist = [];

// Serve static HTML files (dashboard and display)
app.use(express.static('public'));

// API to get the current waitlist
app.get('/api/waitlist', (req, res) => res.json(waitlist));

// API to add a customer to the waitlist
app.post('/api/waitlist', express.json(), (req, res) => {
    waitlist.push(req.body);
    waitlist.sort((a, b) => a.time.localeCompare(b.time));  // Sort by time
    res.json(waitlist);
});

// API to remove a customer from the waitlist
app.delete('/api/waitlist/:index', (req, res) => {
    const index = req.params.index;
    if (index >= 0 && index < waitlist.length) {
        waitlist.splice(index, 1);  // Remove the customer
        res.json(waitlist);
    } else {
        res.status(400).json({ error: 'Invalid index' });
    }
});

// API to reset the waitlist (clear all customers)
app.post('/api/reset', (req, res) => {
    waitlist = [];
    res.json({ message: 'Waitlist reset' });
});

// Serve the dashboard page
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

// Serve the display page
app.get('/display', (req, res) => res.sendFile(path.join(__dirname, 'public', 'display.html')));

// Start the server on port 3000 (or use Heroku/Render's port)
app.listen(process.env.PORT || 3000, () => console.log('Server is running'));
