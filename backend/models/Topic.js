const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
    estimatedHours: { type: Number, default: 0 },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    tags: [{ type: String }],
    orderIndex: { type: Number, default: 0 },
    targetDate: { type: String, enum: ['Today', 'Tomorrow', 'Someday'], default: 'Someday' },
    resources: { type: String },
    completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
