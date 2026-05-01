const { protect } = require('../../../utils/auth');
const Goal = require('../../../models/Goal');
const Topic = require('../../../models/Topic');
const { analyzeGoalDescription } = require('../../../utils/ai');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

    if (req.method === 'OPTIONS') return res.status(200).end();

    const isAuth = await protect(req, res);
    if (!isAuth) return;

    if (req.method === 'POST') {
        try {
            const { id } = req.query;
            const goal = await Goal.findOne({ _id: id, user: req.user._id });
            if (!goal) return res.status(404).json({ message: 'Goal not found' });

            const topicsData = await analyzeGoalDescription(goal.description);

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

            res.status(200).json(createdTopics);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
