const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Topic = require('../models/Topic');

const router = express.Router();

router.route('/')
    .get(protect, async (req, res) => {
        try {
            const { goalId } = req.query;
            const query = { user: req.user._id };
            if (goalId) query.goal = goalId;

            const topics = await Topic.find(query).sort({ orderIndex: 1 });
            res.json(topics);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, async (req, res) => {
        try {
            const topic = await Topic.create({ ...req.body, user: req.user._id });
            res.status(201).json(topic);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

router.route('/:id')
    .put(protect, async (req, res) => {
        try {
            const topic = await Topic.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                req.body,
                { new: true }
            );
            if (!topic) return res.status(404).json({ message: 'Topic not found' });
            res.json(topic);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .delete(protect, async (req, res) => {
        try {
            const topic = await Topic.findOneAndDelete({ _id: req.params.id, user: req.user._id });
            if (!topic) return res.status(404).json({ message: 'Topic not found' });
            res.json({ message: 'Topic removed' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

module.exports = router;
