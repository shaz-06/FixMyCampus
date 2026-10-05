const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, studentId: { type: String, unique: true, sparse: true, trim: true },
  department: { type: String, trim: true }, year: { type: String, trim: true }, role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });
schema.pre('save', async function(next) { if (!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 12); next(); });
schema.methods.comparePassword = function(password) { return bcrypt.compare(password, this.password); };
schema.set('toJSON', { transform: (_, ret) => { delete ret.password; return ret; } });
module.exports = mongoose.model('User', schema);
