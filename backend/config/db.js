const mongoose = require('mongoose');
module.exports = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured. Copy backend/.env.example to backend/.env.');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};
