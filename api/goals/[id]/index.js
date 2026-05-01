const { protect } = require('../../../utils/auth');
const Goal = require('../../../models/Goal');
const Topic = require('../../../models/Topic');
const Log = require('../../../models/Log');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

    if (req.method === 'OPTIONS') return res.status(200).end();

    const isAuth = await protect(req, res);
    if (!isAuth) return;

    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            const goal = await Goal.findOneAndDelete({ _id: id, user: req.user._id });
            if (!goal) return res.status(404).json({ message: 'Goal not found' });

            const topics = await Topic.find({ goal: goal._id });
            const topicIds = topics.map(t => t._id);

            if (topicIds.length > 0) {
                await Log.deleteMany({ topic: { $in: topicIds } });
            }

            await Topic.deleteMany({ goal: goal._id });

            res.status(200).json({ message: 'Goal and related topics/logs removed' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
