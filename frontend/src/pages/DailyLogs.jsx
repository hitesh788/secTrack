import { useState, useEffect } from 'react';
import api from '../services/api';

export default function DailyLogs() {
    const [logs, setLogs] = useState([]);
    const [showLeaveForm, setShowLeaveForm] = useState(false);
    const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
    const [leaveReason, setLeaveReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/logs');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveLeave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/logs', {
                date: leaveDate,
                isMissedDay: true,
                reasonMissed: leaveReason,
                completedTasks: 'Leave / Did not study'
            });
            setLogs([res.data, ...logs]);
            setLeaveReason('');
            setShowLeaveForm(false);
        } catch (err) {
            console.error(err);
            alert('Failed to log leave status');
        }
        setLoading(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Daily Progress Logs</h1>
                <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => setShowLeaveForm(!showLeaveForm)}>
                    {showLeaveForm ? 'Cancel' : 'Add Leave Status'}
                </button>
            </div>

            {showLeaveForm && (
                <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--danger)' }}>Log a Leave Day</h3>
                    <form onSubmit={handleSaveLeave} style={{ marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Date of Leave</label>
                            <input type="date" className="form-control" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Reason</label>
                            <textarea className="form-control" value={leaveReason} onChange={e => setLeaveReason(e.target.value)} rows="2" required placeholder="e.g. Sick leave, travelling, needing a break..."></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ background: 'var(--danger)' }} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Leave Log'}
                        </button>
                    </form>
                </div>
            )}

            <div>
                <div>
                    <h3>Recent Logs</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {logs.map(log => (
                            <div key={log._id} className="glass-panel">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong className="text-gradient">{new Date(log.date).toLocaleDateString()}</strong>
                                    <span>{log.isMissedDay ? <span className="badge badge-NotStarted" style={{ color: 'var(--danger)', background: 'rgba(220,38,38,0.1)', borderColor: 'rgba(220,38,38,0.2)' }}>Missed</span> : <span className="badge badge-Completed">Completed</span>}</span>
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
