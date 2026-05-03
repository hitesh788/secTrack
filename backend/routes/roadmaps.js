const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const Roadmap = require('../models/Roadmap');

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.route('/')
    .get(protect, async (req, res) => {
        try {
            const roadmaps = await Roadmap.find({ user: req.user._id }).sort({ createdAt: -1 });
            res.json(roadmaps);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, upload.single('roadmapFile'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Please upload a file' });
            }

            const roadmapData = {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                fileUrl: `/uploads/${req.file.filename}`,
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                user: req.user._id
            };

            const roadmap = await Roadmap.create(roadmapData);
            res.status(201).json(roadmap);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

router.route('/:id')
    .delete(protect, async (req, res) => {
        try {
            const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });
            if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

            // Delete physical file
            const filePath = path.join(__dirname, '..', roadmap.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            await roadmap.deleteOne();
            res.json({ message: 'Roadmap removed' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

module.exports = router;
