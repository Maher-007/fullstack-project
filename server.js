const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// This allows us to read JSON data sent from the frontend
app.use(express.json());

// 1. CONNECT TO DATABASE
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tinasco129!!', // CHANGE THIS to your MySQL password
    database: 'maahir_first_internship' // CHANGE THIS to your database name
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// 2. CREATE (POST) - Add a new user
app.post('/users', (req, res) => {
    const { name, email } = req.body;
    const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
    db.query(sql, [name, email], (err, result) => {
        if (err) throw err;
        res.send('User added successfully!');
    });
});

// 3. READ (GET) - Get all users
app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// 4. UPDATE (PUT) - Update a user
app.put('/users/:id', (req, res) => {
    const { name, email } = req.body;
    const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    db.query(sql, [name, email, req.params.id], (err, result) => {
        if (err) throw err;
        res.send('User updated successfully!');
    });
});

// 5. DELETE - Remove a user
app.delete('/users/:id', (req, res) => {
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.send('User deleted successfully!');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});