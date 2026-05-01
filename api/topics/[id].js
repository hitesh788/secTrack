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
        const { id } = req.query;

        if (req.method === 'PUT') {
            const topic = await Topic.findOneAndUpdate(
                { _id: id, user: req.user._id },
                req.body,
                { new: true }
            );
            if (!topic) return res.status(404).json({ message: 'Topic not found' });
            res.status(200).json(topic);
        }
        else if (req.method === 'DELETE') {
            const topic = await Topic.findOneAndDelete({ _id: id, user: req.user._id });
            if (!topic) return res.status(404).json({ message: 'Topic not found' });
            res.status(200).json({ message: 'Topic removed' });
        }
        else {
            res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
