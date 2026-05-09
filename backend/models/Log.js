const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }, // Optional, can just be general log
    date: { type: Date, required: true },
    completedTasks: { type: String, default: '' },
    hoursSpent: { type: Number, default: 0 },
    notes: { type: String },

    // New fields for missed study days
    isMissedDay: { type: Boolean, default: false },
    reasonMissed: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
