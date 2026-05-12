const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateString: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent'], required: true },
    note: { type: String, default: '' },
    leaveReason: { type: String, default: '' },
    autoMarked: { type: Boolean, default: false }
}, { timestamps: true });

attendanceSchema.index({ user: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
