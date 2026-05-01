import { useState, useEffect } from 'react';
import api from '../services/api';

export default function DailyLogs() {
    const [logs, setLogs] = useState([]);
    const [topics, setTopics] = useState([]);
    const [formData, setFormData] = useState({
        topicId: '', date: new Date().toISOString().split('T')[0], completedTasks: '', hoursSpent: '', notes: '', statusUpdate: '', isMissedDay: false, reasonMissed: ''
    });

    useEffect(() => {
        fetchLogs();
        fetchTopics();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/logs');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await api.get('/topics');
            setTopics(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/logs', formData);
            setLogs([res.data, ...logs]); // add new log at top
            setFormData({ topicId: '', date: new Date().toISOString().split('T')[0], completedTasks: '', hoursSpent: '', notes: '', statusUpdate: '', isMissedDay: false, reasonMissed: '' });
        } catch (err) {
            alert('Failed to save log');
        }
    };

    return (
        <div>
            <h1 className="page-title">Daily Progress Logs</h1>
            <div className="grid-2">
                <div className="glass-panel">
                    <h3>Log Activity</h3>
                    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" id="missedDay" checked={formData.isMissedDay} onChange={e => setFormData({ ...formData, isMissedDay: e.target.checked })} style={{ width: 'auto' }} />
                            <label htmlFor="missedDay" style={{ margin: 0 }}>I did not study on this day</label>
                        </div>

                        {!formData.isMissedDay ? (
                            <>
                                <div className="form-group">
                                    <label>Related Topic (Optional)</label>
                                    <select className="form-control" value={formData.topicId} onChange={e => setFormData({ ...formData, topicId: e.target.value })}>
                                        <option value="">General Log (No Topic)</option>
                                        {topics.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                                    </select>
                                </div>
                                {formData.topicId && (
                                    <div className="form-group">
                                        <label>Update Topic Status?</label>
                                        <select className="form-control" value={formData.statusUpdate} onChange={e => setFormData({ ...formData, statusUpdate: e.target.value })}>
                                            <option value="">Keep current status</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Completed Tasks</label>
                                    <input type="text" className="form-control" value={formData.completedTasks} onChange={e => setFormData({ ...formData, completedTasks: e.target.value })} placeholder="e.g. Practiced Nmap scanning" required />
                                </div>
                                <div className="form-group">
                                    <label>Hours Spent</label>
                                    <input type="number" step="0.1" className="form-control" value={formData.hoursSpent} onChange={e => setFormData({ ...formData, hoursSpent: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea className="form-control" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows="3"></textarea>
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label>Reason for not studying</label>
                                <textarea className="form-control" value={formData.reasonMissed} onChange={e => setFormData({ ...formData, reasonMissed: e.target.value })} placeholder="e.g. Was feeling sick, Had to work overtime..." required rows="3"></textarea>
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary">Save Log</button>
                    </form>
                </div>

                <div>
                    <h3>Recent Logs</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {logs.map(log => (
                            <div key={log._id} className="glass-panel">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong className="text-gradient">{new Date(log.date).toLocaleDateString()}</strong>
                                    <span>{log.isMissedDay ? <span className="badge badge-NotStarted" style={{ color: 'var(--danger)', background: 'rgba(220,38,38,0.1)', borderColor: 'rgba(220,38,38,0.2)' }}>Missed</span> : `${log.hoursSpent} hrs`}</span>
                                </div>
                                {log.isMissedDay ? (
                                    <>
                                        <h4 style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Did not study</h4>
                                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}><strong>Reason:</strong> {log.reasonMissed}</p>
                                    </>
                                ) : (
                                    <>
                                        <h4 style={{ marginTop: '0.5rem' }}>{log.completedTasks}</h4>
                                        {log.topic && <span className="badge badge-InProgress" style={{ display: 'inline-block', marginTop: '0.25rem' }}>Topic: {log.topic.title}</span>}
                                        {log.notes && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{log.notes}</p>}
                                    </>
                                )}
                            </div>
                        ))}
                        {logs.length === 0 && <p className="text-muted">No logs recorded yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
