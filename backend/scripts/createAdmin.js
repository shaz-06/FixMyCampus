const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const User = require('../models/User');
const BCRYPT_ROUNDS = 12; // Kept in sync with backend/models/User.js.

const required = ['MONGO_URI', 'ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

async function createAdmin() {
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  const name = process.env.ADMIN_NAME.trim();
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, BCRYPT_ROUNDS);

  await mongoose.connect(process.env.MONGO_URI);

  const existingUser = await User.findOne({ email }).select('_id');
  if (existingUser) {
    console.log('An account with this admin email already exists; no user was created.');
    return;
  }

  // Insert the already-hashed password so the User pre-save hook does not hash it again.
  await User.collection.insertOne({
    name,
    email,
    password: passwordHash,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('Admin user created successfully with role: admin.');
}

createAdmin()
  .catch((error) => {
    // Configuration and database errors can contain sensitive details; do not print them.
    console.error('Admin user creation failed. Verify the required environment variables and database access.');
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
