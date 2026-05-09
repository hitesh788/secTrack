const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'General' },
    title: { type: String, required: true },
    link: { type: String },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
