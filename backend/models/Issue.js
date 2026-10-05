const mongoose = require('mongoose');
module.exports = mongoose.model('Issue', new mongoose.Schema({
  title: { type: String, required: true, trim: true }, description: { type: String, required: true, trim: true },
  category: { type: String, required: true }, location: { type: String, required: true, trim: true }, priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium' },
  status: { type: String, enum: ['Pending','In Progress','Resolved','Rejected'], default: 'Pending' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true }));
