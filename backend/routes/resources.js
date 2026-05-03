const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Resource = require('../models/Resource');

const router = express.Router();

router.route('/')
    .get(protect, async (req, res) => {
        try {
            const resources = await Resource.find({ user: req.user._id }).sort({ createdAt: -1 });
            res.json(resources);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, async (req, res) => {
        try {
            const resource = await Resource.create({ ...req.body, user: req.user._id });
            res.status(201).json(resource);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

router.route('/:id')
    .delete(protect, async (req, res) => {
        try {
            const resource = await Resource.findOneAndDelete({ _id: req.params.id, user: req.user._id });
            if (!resource) return res.status(404).json({ message: 'Resource not found' });
            res.json({ message: 'Resource removed' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

module.exports = router;
