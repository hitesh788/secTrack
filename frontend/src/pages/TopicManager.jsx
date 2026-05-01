import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TopicManager() {
    const [topics, setTopics] = useState([]);
    const [filter, setFilter] = useState('All');

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
                                {t.tags.map(tag => <span key={tag} style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>#{tag}</span>)}
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
                {topics.length === 0 && <p className="text-muted">No topics found. Create a goal and run AI analysis first!</p>}
            </div>
        </div>
    );
}
