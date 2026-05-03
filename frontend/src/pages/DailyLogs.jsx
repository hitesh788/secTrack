import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, AlertCircle, CheckCircle, Plus, X, Filter } from 'lucide-react';

export default function DailyLogs() {
    const [logs, setLogs] = useState([]);
    const [showLeaveForm, setShowLeaveForm] = useState(false);
    const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
    const [leaveReason, setLeaveReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState('All');

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

    const getFilteredLogs = () => {
        if (timeFilter === 'All') return logs;

        const now = new Date();
        const filterDate = new Date();

        if (timeFilter === 'This Week') {
            filterDate.setDate(now.getDate() - 7);
        } else if (timeFilter === 'This Month') {
            filterDate.setMonth(now.getMonth() - 1);
        }

        return logs.filter(log => new Date(log.date) >= filterDate);
    };

    const filteredLogs = getFilteredLogs();

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="page-title" style={{ margin: 0, border: 'none' }}>Daily Progress Logs</h1>
                <button
                    className={`btn ${showLeaveForm ? 'btn-outline' : 'btn-primary'}`}
                    style={{ backgroundColor: showLeaveForm ? 'transparent' : 'var(--danger)', borderColor: 'var(--danger)', color: showLeaveForm ? 'var(--danger)' : 'white' }}
                    onClick={() => setShowLeaveForm(!showLeaveForm)}
                >
                    {showLeaveForm ? <><X size={18} /> Close</> : <><Plus size={18} /> Add Leave Status</>}
                </button>
            </div>

            {showLeaveForm && (
                <div className="planner-form-container" style={{ marginBottom: '2.5rem', borderStyle: 'solid', borderColor: 'var(--danger)', background: 'rgba(252, 165, 165, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--danger)' }}>
                        <AlertCircle size={22} />
                        <h3 style={{ margin: 0 }}>Log a Day of Leave</h3>
                    </div>
                    <form onSubmit={handleSaveLeave}>
                        <div className="grid-2" style={{ gap: '1.5rem' }}>
                            <div className="form-group">
                                <label>Date of Leave</label>
                                <input type="date" className="form-control" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Reason for Leave</label>
                                <input className="form-control" value={leaveReason} onChange={e => setLeaveReason(e.target.value)} required placeholder="e.g. Sick, traveling, exam preparation..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary" style={{ background: 'var(--danger)', padding: '0.75rem 2rem' }} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Leave Log'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calendar size={24} className="text-gradient" />
                        <h2 style={{ margin: 0, fontWeight: 800 }}>Recent Activity</h2>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', background: '#e5e7eb', padding: '4px', borderRadius: '8px' }}>
                        {['All', 'This Week', 'This Month'].map(f => (
                            <button
                                key={f}
                                onClick={() => setTimeFilter(f)}
                                className="btn"
                                style={{
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.8rem',
                                    background: timeFilter === f ? 'white' : 'transparent',
                                    color: timeFilter === f ? 'var(--primary)' : 'var(--text-muted)',
                                    boxShadow: timeFilter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    border: 'none',
                                    borderRadius: '6px'
                                }}
                            >
                                <Filter size={14} style={{ display: timeFilter === f ? 'inline' : 'none', marginRight: '4px' }} />
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="log-grid">
                    {filteredLogs.map(log => (
                        <div key={log._id} className={`log-card ${log.isMissedDay ? 'log-card-missed' : 'log-card-completed'}`}>
                            <div className="log-header">
                                <div className="log-date">
                                    <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                    {new Date(log.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                                {log.isMissedDay ?
                                    <span style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <X size={14} /> MISSED
                                    </span> :
                                    <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle size={14} /> COMPLETED
                                    </span>
                                }
                            </div>

                            <h4 className="log-title">{log.isMissedDay ? 'Did not study' : log.completedTasks}</h4>

                            {!log.isMissedDay && log.topic && (
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <span className="log-topic-pill">Topic: {log.topic.title}</span>
                                </div>
                            )}

                            <div style={{ flexGrow: 1 }}>
                                {log.isMissedDay ? (
                                    <p className="log-reason">Reason: {log.reasonMissed}</p>
                                ) : (
                                    log.notes && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{log.notes}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredLogs.length === 0 && (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
                        <Calendar size={48} className="text-muted" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p className="text-muted">No logs found for the selected period.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
