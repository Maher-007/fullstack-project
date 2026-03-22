import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to the server OUTSIDE the App function
const socket = io.connect('http://localhost:5000');

function App() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Listener for Real-Time Messages
  useEffect(() => {
    socket.on('welcome', (message) => {
      alert(message);
    });
  }, []);

  // 1. Login Function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        fetchUsers(data.token);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error. Is the server running?');
    }
  };

  // 2. Fetch Users Function
  const fetchUsers = async (currentToken) => {
    try {
      const response = await fetch('http://localhost:5000/users', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        alert('Failed to fetch users');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsers([]);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Level 3 Full Stack App</h1>

      {!isLoggedIn ? (
        <div style={{ maxWidth: '300px', margin: 'auto' }}>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ display: 'block', width: '100%', margin: '10px 0', padding: '8px' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ display: 'block', width: '100%', margin: '10px 0', padding: '8px' }}
            />
            <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
          </form>
        </div>
      ) : (
        <div>
          <button onClick={handleLogout} style={{ marginBottom: '20px' }}>Logout</button>
          <div style={{ border: '1px solid #ccc', padding: '10px' }}>
            {users.length === 0 ? (
              <p>Loading users...</p>
            ) : (
              users.map(user => (
                <div key={user.id} style={{ borderBottom: '1px solid #eee', padding: '10px' }}>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;