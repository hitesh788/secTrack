const { protect } = require('../../utils/auth');
const Log = require('../../models/Log');
const Topic = require('../../models/Topic');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

    if (req.method === 'OPTIONS') return res.status(200).end();

    const isAuth = await protect(req, res);
    if (!isAuth) return;

    try {
        if (req.method === 'GET') {
            const logs = await Log.find({ user: req.user._id }).populate('topic').sort({ date: -1 });
            res.status(200).json(logs);
        }
        else if (req.method === 'POST') {
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
        }
        else {
            res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
