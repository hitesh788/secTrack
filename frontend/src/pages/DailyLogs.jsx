import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, AlertCircle, CheckCircle, Plus, X, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DailyLogs() {
    const [logs, setLogs] = useState([]);
    const [showLeaveForm, setShowLeaveForm] = useState(false);
    const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
    const [leaveReason, setLeaveReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState('All');
    const [attendance, setAttendance] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceSubmitting, setAttendanceSubmitting] = useState(false);

    useEffect(() => {
        fetchLogs();
        fetchAttendance();
    }, []);

    const getLocalDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    const getLocalTime = () => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    };

    const fetchAttendance = async () => {
        setAttendanceLoading(true);
        try {
            const localDate = getLocalDate();
            const localTime = getLocalTime();
            const res = await api.get(`/attendance?localDate=${localDate}&localTime=${localTime}`);
            setAttendance(res.data);
        } catch (err) {
            console.error(err);
        }
        setAttendanceLoading(false);
    };

    const handleMarkAttendance = async () => {
        setAttendanceSubmitting(true);
        try {
            const localDate = getLocalDate();
            const res = await api.post('/attendance', {
                date: localDate,
                status: 'Present',
                note: 'Daily attendance recorded.'
            });

            const attendanceEntry = res.data;
            if (!attendance.some(entry => entry.dateString === attendanceEntry.dateString)) {
                setAttendance([attendanceEntry, ...attendance]);
            } else {
                setAttendance(attendance.map(entry => entry.dateString === attendanceEntry.dateString ? attendanceEntry : entry));
            }

            toast.success('Attendance recorded for today.');
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message;
            toast.error(message || 'Failed to record attendance.');
        }
        setAttendanceSubmitting(false);
    };

    const todayAttendance = attendance.find(entry => entry.dateString === getLocalDate());

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

            <div className="planner-form-container" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calendar size={24} className="text-gradient" />
                        <div>
                            <h3 style={{ margin: 0 }}>Daily Attendance</h3>
                            <p className="planner-subtitle" style={{ margin: 0 }}>Mark your attendance for today before 11:30 PM. If missing, you will be auto marked absent.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        {attendanceLoading ? (
                            <span className="badge badge-muted">Checking attendance...</span>
                        ) : todayAttendance ? (
                            <span className={`badge badge-${todayAttendance.status === 'Present' ? 'success' : 'danger'}`}>
                                {todayAttendance.status}{todayAttendance.autoMarked ? ' (Auto)' : ''}
                            </span>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleMarkAttendance}
                                disabled={attendanceSubmitting}
                            >
                                {attendanceSubmitting ? 'Marking...' : 'Mark Present'}
                            </button>
                        )}
                        {todayAttendance && todayAttendance.note && (
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{todayAttendance.note}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Attendance History</h3>
                {attendance.length === 0 ? (
                    <p className="text-muted">No attendance records yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="report-table" style={{ width: '100%', minWidth: '520px' }}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Day</th>
                                    <th>Status</th>
                                    <th>Recorded At</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map(entry => {
                                    const date = new Date(entry.date);
                                    const recordedAt = new Date(entry.createdAt || entry.date);
                                    return (
                                        <tr key={entry._id}>
                                            <td>{date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                            <td>{date.toLocaleDateString(undefined, { weekday: 'long' })}</td>
                                            <td>{entry.status}{entry.autoMarked ? ' (Auto)' : ''}</td>
                                            <td>{recordedAt.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                            <td>{entry.note || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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
