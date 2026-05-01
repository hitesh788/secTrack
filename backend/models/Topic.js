const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
    estimatedHours: { type: Number, default: 0 },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    tags: [{ type: String }],
    orderIndex: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
