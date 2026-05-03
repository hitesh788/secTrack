const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String
    },
    fileType: {
        type: String
    },
    category: {
        type: String,
        default: 'General'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
