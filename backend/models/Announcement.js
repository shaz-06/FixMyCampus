const mongoose = require('mongoose');
module.exports = mongoose.model('Announcement', new mongoose.Schema({ title: { type: String, required: true, trim: true }, content: { type: String, required: true, trim: true }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } }, { timestamps: true }));
