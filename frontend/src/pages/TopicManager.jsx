import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TopicManager() {
    const [topics, setTopics] = useState([]);
    const [filter, setFilter] = useState('All');
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [loadingLog, setLoadingLog] = useState(false);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const res = await api.get('/topics');
            setTopics(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await api.put(`/topics/${id}`, { status });
            setTopics(topics.map(t => t._id === id ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTopicAndLog = async (e) => {
        e.preventDefault();
        if (!newTitle || !newDescription) return;
        setLoadingLog(true);
        try {
            const topicRes = await api.post('/topics', {
                title: newTitle,
                description: newDescription,
                status: 'Completed'
            });
            const newTopic = topicRes.data;
            setTopics([newTopic, ...topics]);

            await api.post('/logs', {
                topicId: newTopic._id,
                date: new Date().toISOString(),
                completedTasks: newTitle,
                notes: newDescription,
                statusUpdate: 'Completed'
            });

            setNewTitle('');
            setNewDescription('');
            alert('Topic created and log saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save Topic and Log');
        }
        setLoadingLog(false);
    };

    const filteredTopics = topics.filter(t => filter === 'All' || t.status === filter);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">Topic Manager</h1>
                <select className="form-control" style={{ width: '200px' }} value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="All">All Topics</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <h3>Add Today's Completed Topic</h3>
                <form onSubmit={handleAddTopicAndLog} style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                        <label>Title of Topic</label>
                        <input className="form-control" value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="e.g. Mastered React Hooks" />
                    </div>
                    <div className="form-group">
                        <label>What we learned today (Description)</label>
                        <textarea className="form-control" value={newDescription} onChange={e => setNewDescription(e.target.value)} rows="3" required placeholder="Detailed notes about what was learned..."></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loadingLog}>
                        {loadingLog ? 'Saving...' : 'Save Log with Timestamp'}
                    </button>
                </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredTopics.map(t => (
                    <div key={t._id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {t.title}
                                <span className={`badge badge-${t.status.replace(' ', '')}`}>{t.status}</span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{t.priority}</span>
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t.description}</p>
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                {t.tags && t.tags.map(tag => <span key={tag} style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>#{tag}</span>)}
                            </div>
                        </div>
                        <div>
                            <select className="form-control" value={t.status} onChange={(e) => updateStatus(t._id, e.target.value)}>
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                ))}
                {topics.length === 0 && <p className="text-muted">No topics found. Add a completed topic above to get started!</p>}
            </div>
        </div>
    );
}
