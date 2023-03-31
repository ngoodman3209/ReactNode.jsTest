const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const auth0 = require('auth0-js');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

const secret = 'your_secret_key';

function generateToken(user) {
  const token = jwt.sign({ user }, secret, { expiresIn: '1h' });
  return token;
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).send('No token provided');
    return;
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.status(401).send('Invalid token');
      return;
    }
    req.user = decoded.user;
    next();
  });
}

// Endpoint for creating a new user
app.post('/users', (req, res) => {
  const { name, username } = req.body;

  // Insert the new user into the database
  connection.query(
    'INSERT INTO users (name, username) VALUES (?, ?)',
    [name, username],
    (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Error creating user');
        return;
      }
      console.log('User created successfully:', result);
      res.status(201).send('User created successfully');
    }
  );
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
