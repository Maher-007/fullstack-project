const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors()); // Allow React to connect

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tinasco129!!', // <-- PUT YOUR PASSWORD HERE
    database: 'maahir_first_internship',
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// SECRET KEY for tokens (like a password for your server)
const JWT_SECRET = 'my_super_secret_key_123';

// --- AUTHENTICATION ROUTES ---

// 1. REGISTER (Create a new user with hashed password)
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).send('Email already exists');
            return res.status(500).send(err);
        }
        res.send('User registered successfully!');
    });
});

// 2. LOGIN (Check password and give a token)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(400).send('User not found');

        const user = results[0];

        // Compare typed password with database password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid password');

        // Create a Token
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
});

// --- PROTECTED ROUTES ---

const authenticateToken = (req, res, next) => {
    console.log("Authorization Header:", req.headers['authorization']);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1].trim();
    
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// 3. GET USERS (Only if logged in)
app.get('/users', authenticateToken, (req, res) => {
    const sql = 'SELECT id, name, email FROM users';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);
    
    // Send a welcome message to the frontend
    socket.emit('welcome', 'Welcome to the Real-Time Server!');
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});