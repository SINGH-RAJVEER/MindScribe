const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/mindscribe');

const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;
