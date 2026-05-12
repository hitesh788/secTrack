const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');

const router = express.Router();

const parseLocalDateString = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const shouldAutoMarkAbsent = (localTime) => {
    if (!localTime) return false;
    const [hour, minute] = localTime.split(':').map(Number);
    return hour > 23 || (hour === 23 && minute >= 30);
};

router.route('/')
    .get(protect, async (req, res) => {
        try {
            const { localDate, localTime } = req.query;
            if (localDate && localTime && shouldAutoMarkAbsent(localTime)) {
                const existing = await Attendance.findOne({ user: req.user._id, dateString: localDate });
                if (!existing) {
                    try {
                        await Attendance.create({
                            user: req.user._id,
                            dateString: localDate,
                            date: parseLocalDateString(localDate),
                            status: 'Absent',
                            note: 'Auto-marked absent after 11:30 PM local time.',
                            autoMarked: true
                        });
                    } catch (error) {
                        if (error.code !== 11000) throw error;
                    }
                }
            }

            const attendanceRecords = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
            res.json(attendanceRecords);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, async (req, res) => {
        try {
            const { date, status, note } = req.body;
            if (!date || !status) {
                return res.status(400).json({ message: 'Date and status are required.' });
            }

            const dateString = date;
            const attendanceDate = parseLocalDateString(dateString);
            if (!attendanceDate || Number.isNaN(attendanceDate.getTime())) {
                return res.status(400).json({ message: 'Invalid date format.' });
            }

            const existing = await Attendance.findOne({ user: req.user._id, dateString });
            if (existing) {
                if (existing.status === status) {
                    return res.status(200).json(existing);
                }

                if (status === 'Present' && existing.status === 'Absent') {
                    existing.status = 'Present';
                    existing.note = note || existing.note;
                    existing.autoMarked = false;
                    await existing.save();
                    return res.status(200).json(existing);
                }

                return res.status(409).json({ message: 'Attendance already recorded for this date.' });
            }

            const attendance = await Attendance.create({
                user: req.user._id,
                dateString,
                date: attendanceDate,
                status,
                note: note || '',
                autoMarked: false
            });

            res.status(201).json(attendance);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

router.route('/:id')
    .patch(protect, async (req, res) => {
        try {
            const { leaveReason } = req.body;
            if (leaveReason === undefined) {
                return res.status(400).json({ message: 'leaveReason is required.' });
            }

            const attendance = await Attendance.findOne({ _id: req.params.id, user: req.user._id });
            if (!attendance) {
                return res.status(404).json({ message: 'Attendance record not found.' });
            }

            attendance.leaveReason = leaveReason;
            await attendance.save();
            res.json(attendance);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

module.exports = router;
