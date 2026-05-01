const { protect } = require('../../utils/auth');
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
            const { goalId } = req.query;
            const query = { user: req.user._id };
            if (goalId) query.goal = goalId;

            const topics = await Topic.find(query).sort({ orderIndex: 1 });
            res.status(200).json(topics);
        }
        else if (req.method === 'POST') {
            const topic = await Topic.create({ ...req.body, user: req.user._id });
            res.status(201).json(topic);
        }
        else {
            res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
