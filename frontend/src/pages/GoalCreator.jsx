import { useState, useEffect } from 'react';
import api from '../services/api';
import { Target, Calendar, Trash2, Plus, Flag, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

export default function GoalCreator() {
    const [goals, setGoals] = useState([]);
    const [topics, setTopics] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [gRes, tRes] = await Promise.all([
                api.get('/goals'),
                api.get('/topics')
            ]);
            setGoals(gRes.data);
            setTopics(tRes.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/goals', { title, description, startDate, targetDate });
            setGoals([...goals, res.data]);
            setTitle('');
            setDescription('');
            setStartDate('');
            setTargetDate('');
            toast.success('Mission goal established successfully!');
        } catch (err) {
            toast.error('Failed to initiate mission goal.');
        }
        setLoading(false);
    };

    const confirmDelete = (goalId) => {
        setDeleteId(goalId);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            await api.delete(`/goals/${deleteId}`);
            setGoals(goals.filter(g => g._id !== deleteId));
            toast.info('Mission goal decommissioned.');
        } catch (err) {
            toast.error('Failed to decommission goal.');
        }
        setLoading(false);
    };

    const calculateProgress = (goalId) => {
        const goalTopics = topics.filter(t => (t.goal && (t.goal._id || t.goal) === goalId));
        if (goalTopics.length === 0) return 0;
        const completed = goalTopics.filter(t => t.status === 'Completed').length;
        return Math.round((completed / goalTopics.length) * 100);
    };

    if (loading && goals.length === 0) return (
        <div className="loader-container">
            <div className="spinner"></div>
            <div className="loading-text">SYNCING MISSION PARAMETERS...</div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className="page-title">Goal Creator</h1>

            <div className="grid-2">
                <div className="goal-form-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Target size={28} className="text-gradient" />
                        <h3 style={{ margin: 0, fontWeight: 800 }}>Define New Mission</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
                        Clearly articulate your security learning objective to stay focused on your destination.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Mission Title</label>
                            <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Become a SOC Analyst Level 1" />
                        </div>
                        <div className="form-group">
                            <label>Detailed Mission Parameters</label>
                            <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows="5" required placeholder="I will master SIEM tools, learn log analysis, and get Blue Team Level 1 certified..." />
                        </div>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Deadline / Target Date</label>
                            <input type="date" className="form-control" value={targetDate} onChange={e => setTargetDate(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontWeight: 700, borderRadius: '10px' }} disabled={loading}>
                            {loading ? 'Initiating...' : <><Plus size={20} /> Establish Goal</>}
                        </button>
                    </form>
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Flag size={24} style={{ color: 'var(--primary)' }} />
                        <h3 style={{ margin: 0, fontWeight: 700 }}>Active Missions ({goals.length})</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {goals.map(g => {
                            const progress = calculateProgress(g._id);
                            return (
                                <div key={g._id} className="goal-card">
                                    <div className="goal-card-header">
                                        <h4 className="goal-card-title">{g.title}</h4>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '6px', color: 'var(--danger)', borderColor: 'rgba(220,38,38,0.2)' }}
                                            onClick={() => confirmDelete(g._id)}
                                            disabled={loading}
                                            title="Delete Mission"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="goal-card-desc">{g.description}</p>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                                            <span style={{ color: 'var(--text-muted)' }}>MISSION PROGRESS</span>
                                            <span style={{ color: 'var(--primary)' }}>{progress}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s ease' }}></div>
                                        </div>
                                    </div>

                                    <div className="goal-meta">
                                        <div className="goal-meta-item">
                                            <Calendar size={14} />
                                            {g.startDate ? `Start: ${new Date(g.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No Start Date'}
                                        </div>
                                        <div className="goal-meta-item">
                                            <Calendar size={14} />
                                            {g.targetDate ? `Target: ${new Date(g.targetDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No Deadline'}
                                        </div>
                                        <div className="goal-meta-item">
                                            {progress === 100 ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> : <Info size={14} />}
                                            {progress === 100 ? 'Mission Accomplished' : 'Active'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {goals.length === 0 && (
                            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
                                <Target size={32} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                                <p className="text-muted">You haven't defined any missions yet. Start by creating one on the left!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Decommission Mission?"
                message="This will permanently delete this mission goal and all its associated topic tracking. This operational data cannot be recovered."
            />
        </div>
    );
}
