const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Log = require('../models/Log');
const Topic = require('../models/Topic');

const router = express.Router();

router.route('/')
    .get(protect, async (req, res) => {
        try {
            const logs = await Log.find({ user: req.user._id }).populate('topic').sort({ date: -1 });
            res.json(logs);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, async (req, res) => {
        try {
            const { topicId, date, completedTasks, hoursSpent, notes, isMissedDay, reasonMissed } = req.body;

            const log = await Log.create({
                user: req.user._id,
                topic: topicId || null,
                date,
                completedTasks: completedTasks || '',
                hoursSpent: hoursSpent || 0,
                notes,
                isMissedDay: isMissedDay || false,
                reasonMissed: reasonMissed || ''
            });

            if (topicId && req.body.statusUpdate) {
                await Topic.findByIdAndUpdate(topicId, { status: req.body.statusUpdate });
            }

            res.status(201).json(log);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

module.exports = router;
