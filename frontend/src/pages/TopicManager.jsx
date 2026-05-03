import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, CheckCircle, Clock, ArrowRight, CornerDownRight, Database } from 'lucide-react';
import { toast } from 'react-toastify';

export default function TopicManager() {
    const [topics, setTopics] = useState([]);

    // For Today form
    const [todayTitle, setTodayTitle] = useState('');
    const [todayDesc, setTodayDesc] = useState('');
    const [todayResources, setTodayResources] = useState('');

    // For Tomorrow form
    const [tomorrowTitle, setTomorrowTitle] = useState('');
    const [tomorrowDesc, setTomorrowDesc] = useState('');
    const [tomorrowResources, setTomorrowResources] = useState('');

    const [loading, setLoading] = useState(false);

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

    const handleAddTopic = async (e, plannedFor) => {
        e.preventDefault();
        const title = plannedFor === 'Today' ? todayTitle : tomorrowTitle;
        const description = plannedFor === 'Today' ? todayDesc : tomorrowDesc;
        const resources = plannedFor === 'Today' ? todayResources : tomorrowResources;

        if (!title) return;
        setLoading(true);
        try {
            const res = await api.post('/topics', {
                title,
                description,
                resources,
                targetDate: plannedFor,
                status: plannedFor === 'Today' ? 'In Progress' : 'Not Started'
            });
            setTopics([res.data, ...topics]);

            if (plannedFor === 'Today') {
                setTodayTitle('');
                setTodayDesc('');
                setTodayResources('');
            } else {
                setTomorrowTitle('');
                setTomorrowDesc('');
                setTomorrowResources('');
            }
            toast.success(`Operational topic scheduled for ${plannedFor}.`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to schedule topic.');
        }
        setLoading(false);
    };

    const completeAndLog = async (topic) => {
        if (!topic.title) return;
        try {
            await api.put(`/topics/${topic._id}`, { status: 'Completed' });
            await api.post('/logs', {
                topicId: topic._id,
                date: new Date().toISOString(),
                completedTasks: topic.title,
                notes: topic.description,
                statusUpdate: 'Completed'
            });
            setTopics(topics.map(t => t._id === topic._id ? { ...t, status: 'Completed' } : t));
            toast.success('Topic completed and intelligence logged.');
        } catch (err) {
            console.error(err);
            toast.error('Failed to log topic completion.');
        }
    };

    const moveTopic = async (topicId, newPlan) => {
        try {
            const status = newPlan === 'Today' ? 'In Progress' : 'Not Started';
            const res = await api.put(`/topics/${topicId}`, { targetDate: newPlan, status });
            setTopics(topics.map(t => t._id === topicId ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const todayTopics = topics.filter(t => (t.targetDate === 'Today' || (!t.targetDate && t.status === 'In Progress')) && t.status !== 'Completed');
    const tomorrowTopics = topics.filter(t => (t.targetDate === 'Tomorrow' || (!t.targetDate && t.status === 'Not Started')) && t.status !== 'Completed');
    const completedTopics = topics.filter(t => t.status === 'Completed');

    const renderTopicCard = (t, currentPlan) => (
        <div key={t._id} className={`planner-card ${currentPlan === 'Today' ? 'planner-card-today' : 'planner-card-tomorrow'}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t.title}</h4>
                <span className={`badge badge-${t.status.replace(' ', '')}`}>{t.status}</span>
            </div>

            {t.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: '1.4' }}>{t.description}</p>}

            {t.resources && (
                <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '6px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Database size={12} /> INTEL VAULT
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0 }}>{t.resources}</p>
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                {currentPlan === 'Today' && (
                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => completeAndLog(t)}>
                        <CheckCircle size={16} /> Complete & Log
                    </button>
                )}
                {currentPlan === 'Tomorrow' && (
                    <button className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={() => moveTopic(t._id, 'Today')}>
                        <ArrowRight size={16} /> Start Today
                    </button>
                )}
                {currentPlan === 'Today' && (
                    <button className="btn btn-outline" title="Push to Tomorrow" onClick={() => moveTopic(t._id, 'Tomorrow')}>
                        <Clock size={16} /> Later
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className="page-title">Topic Planner</h1>

            <div className="grid-2">
                {/* TODAY SECTION */}
                <div className="planner-section">
                    <h2 className="planner-title" style={{ color: 'var(--primary)' }}>
                        <Calendar size={24} /> Plan for Today
                    </h2>
                    <p className="planner-subtitle">What will you complete today?</p>

                    <div className="planner-form-container">
                        <form onSubmit={(e) => handleAddTopic(e, 'Today')}>
                            <div className="form-group">
                                <input className="form-control" value={todayTitle} onChange={e => setTodayTitle(e.target.value)} placeholder="Topic Title..." required />
                            </div>
                            <div className="form-group">
                                <textarea className="form-control" value={todayDesc} onChange={e => setTodayDesc(e.target.value)} rows="2" placeholder="What are you covering today?"></textarea>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <input className="form-control" value={todayResources} onChange={e => setTodayResources(e.target.value)} placeholder="Intel Vault (Links, Resources, Keys...)" />
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                                Add to Today's Plan
                            </button>
                        </form>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                        {todayTopics.length === 0 ? (
                            <div className="planner-empty-state">
                                <Clock className="text-muted" style={{ marginBottom: '0.5rem' }} />
                                <p className="text-muted">No pending topics for today.</p>
                            </div>
                        ) : (
                            todayTopics.map(t => renderTopicCard(t, 'Today'))
                        )}
                    </div>
                </div>

                {/* TOMORROW SECTION */}
                <div className="planner-section">
                    <h2 className="planner-title" style={{ color: 'var(--accent)' }}>
                        <Clock size={24} /> Plan for Tomorrow
                    </h2>
                    <p className="planner-subtitle">What will you study next?</p>

                    <div className="planner-form-container">
                        <form onSubmit={(e) => handleAddTopic(e, 'Tomorrow')}>
                            <div className="form-group">
                                <input className="form-control" value={tomorrowTitle} onChange={e => setTomorrowTitle(e.target.value)} placeholder="Topic Title..." required />
                            </div>
                            <div className="form-group">
                                <textarea className="form-control" value={tomorrowDesc} onChange={e => setTomorrowDesc(e.target.value)} rows="2" placeholder="Brief roadmap notes..."></textarea>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <input className="form-control" value={tomorrowResources} onChange={e => setTomorrowResources(e.target.value)} placeholder="Intel Vault (Links, Resources, Keys...)" />
                            </div>
                            <button className="btn btn-accent" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                                Schedule for Tomorrow
                            </button>
                        </form>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                        {tomorrowTopics.length === 0 ? (
                            <div className="planner-empty-state">
                                <ArrowRight className="text-muted" style={{ marginBottom: '0.5rem' }} />
                                <p className="text-muted">No topics planned for tomorrow.</p>
                            </div>
                        ) : (
                            tomorrowTopics.map(t => renderTopicCard(t, 'Tomorrow'))
                        )}
                    </div>
                </div>
            </div>

            {/* RECENTLY COMPLETED SECTION */}
            <div style={{ marginTop: '4rem', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <CheckCircle size={28} className="text-gradient" />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Recently Completed</h2>
                </div>

                <div className="completed-grid">
                    {completedTopics.slice(0, 6).map(t => (
                        <div key={t._id} className="glass-panel completed-card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.title}</h4>
                                <span className="badge badge-Completed">Done</span>
                            </div>
                            {t.description && (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <CornerDownRight size={14} style={{ marginTop: '3px', color: 'var(--success)' }} />
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{t.description}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {completedTopics.length === 0 && (
                        <div className="glass-panel" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem' }}>
                            <p className="text-muted">Items you complete will appear here as a trophy shelf.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
