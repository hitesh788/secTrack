const { protect } = require('../../utils/auth');
const Goal = require('../../models/Goal');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

    if (req.method === 'OPTIONS') return res.status(200).end();

    const isAuth = await protect(req, res);
    if (!isAuth) return; // protect handles sending the 401 response

    try {
        if (req.method === 'GET') {
            const goals = await Goal.find({ user: req.user._id });
            return res.status(200).json(goals);
        }
        else if (req.method === 'POST') {
            const { title, description, targetDate } = req.body;
            const goal = await Goal.create({
                user: req.user._id,
                title,
                description,
                targetDate
            });
            return res.status(201).json(goal);
        }
        else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
