import { useState, useEffect } from 'react';
import api from '../services/api';

export default function GoalCreator() {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await api.get('/goals');
            setGoals(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/goals', { title, description, targetDate });
            setGoals([...goals, res.data]);
            setTitle('');
            setDescription('');
            setTargetDate('');
        } catch (err) {
            alert('Failed to create goal');
        }
        setLoading(false);
    };

    const handleDelete = async (goalId) => {
        if (!window.confirm('Are you sure you want to delete this goal and all related topics/logs?')) return;
        setLoading(true);
        try {
            await api.delete(`/goals/${goalId}`);
            setGoals(goals.filter(g => g._id !== goalId));
        } catch (err) {
            alert('Failed to delete goal');
        }
        setLoading(false);
    };

    return (
        <div>
            <h1 className="page-title">Goal Creator</h1>
            <div className="grid-2">
                <div className="glass-panel">
                    <h3>Create New Goal</h3>
                    <p className="text-muted" style={{ marginBottom: '1rem' }}>Describe your goal in detail for AI analysis.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Goal Title</label>
                            <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Become a Network Security Engineer" />
                        </div>
                        <div className="form-group">
                            <label>Detailed Description</label>
                            <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows="4" required placeholder="I want to learn TCP/IP, OSI model, Firewalls, and get CCNA certified..." />
                        </div>
                        <div className="form-group">
                            <label>Target Date</label>
                            <input type="date" className="form-control" value={targetDate} onChange={e => setTargetDate(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Save Goal'}
                        </button>
                    </form>
                </div>

                <div>
                    <h3>Your Goals</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {goals.map(g => (
                            <div key={g._id} className="glass-panel">
                                <h4 className="text-gradient">{g.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{g.description}</p>
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleDelete(g._id)} disabled={loading}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {goals.length === 0 && <p className="text-muted">No goals created yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
