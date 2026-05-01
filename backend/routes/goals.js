const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Goal = require('../models/Goal');
const Topic = require('../models/Topic');
const Log = require('../models/Log');
const { analyzeGoalDescription } = require('../utils/ai');

const router = express.Router();

router.route('/')
    .get(protect, async (req, res) => {
        try {
            const goals = await Goal.find({ user: req.user._id });
            res.json(goals);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, async (req, res) => {
        try {
            const { title, description, targetDate } = req.body;
            const goal = await Goal.create({
                user: req.user._id,
                title,
                description,
                targetDate
            });
            res.status(201).json(goal);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

router.post('/:id/analyze', protect, async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        const topicsData = await analyzeGoalDescription(goal.description);

        // Create topics
        const createdTopics = [];
        for (let i = 0; i < topicsData.length; i++) {
            const topic = await Topic.create({
                user: req.user._id,
                goal: goal._id,
                title: topicsData[i].title,
                description: topicsData[i].description,
                estimatedHours: topicsData[i].estimatedHours,
                priority: topicsData[i].priority,
                tags: topicsData[i].tags,
                orderIndex: i
            });
            createdTopics.push(topic);
        }

        res.json(createdTopics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        // Find topics to handle logs
        const topics = await Topic.find({ goal: goal._id });
        const topicIds = topics.map(t => t._id);

        // Delete logs for these topics
        if (topicIds.length > 0) {
            await Log.deleteMany({ topic: { $in: topicIds } });
        }

        // Delete topics
        await Topic.deleteMany({ goal: goal._id });

        res.json({ message: 'Goal and related topics/logs removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
