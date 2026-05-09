const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { protect } = require('../middleware/authMiddleware');
const Roadmap = require('../models/Roadmap');

const router = express.Router();

// Helper to add watermark to PDF
async function addWatermarkToPDF(filePath) {
    try {
        const existingPdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();

            const fontSize = 40;
            const text1 = 'SECTRACK ';
            const text2 = 'PRO';
            const textWidth1 = helveticaBold.widthOfTextAtSize(text1, fontSize);
            const textWidth2 = helveticaBold.widthOfTextAtSize(text2, fontSize);
            const totalWidth = textWidth1 + textWidth2;

            // Center position
            const x = (width - totalWidth) / 2;
            const y = height / 2;

            // Draw SECTRACK (Dark)
            page.drawText(text1, {
                x,
                y,
                size: fontSize,
                font: helveticaBold,
                color: rgb(0.06, 0.09, 0.16),
                opacity: 0.1,
            });

            // Draw PRO (Blue)
            page.drawText(text2, {
                x: x + textWidth1,
                y,
                size: fontSize,
                font: helveticaBold,
                color: rgb(0.14, 0.38, 0.92),
                opacity: 0.1,
            });

            // Small footer stamp
            page.drawText('OFFICIAL MISSION BLUEPRINT | SECURED BY SECTRACK PRO', {
                x: 10,
                y: 10,
                size: 7,
                font: helveticaBold,
                color: rgb(0.5, 0.5, 0.5),
                opacity: 0.2
            });
        }

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(filePath, pdfBytes);
        return true;
    } catch (err) {
        console.error('Watermark Error:', err);
        return false;
    }
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads');
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
    limits: { fileSize: 50 * 1024 * 1024 }
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

            const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);

            // Add watermark if it is a PDF
            if (req.file.mimetype === 'application/pdf') {
                await addWatermarkToPDF(filePath);
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
