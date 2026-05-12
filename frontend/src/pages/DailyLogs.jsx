import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, AlertCircle, CheckCircle, Plus, X, Filter, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DailyLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState('All');
    const [attendance, setAttendance] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceSubmitting, setAttendanceSubmitting] = useState(false);
    const [editingReasonId, setEditingReasonId] = useState(null);
    const [editingReasonValue, setEditingReasonValue] = useState('');
    const [savingReasonId, setSavingReasonId] = useState(null);

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

    const handleSaveLeaveReason = async (attendanceId) => {
        if (!editingReasonValue.trim()) {
            toast.warning('Please enter a reason');
            return;
        }
        
        setSavingReasonId(attendanceId);
        try {
            const res = await api.patch(`/attendance/${attendanceId}`, {
                leaveReason: editingReasonValue
            });
            
            setAttendance(attendance.map(entry => entry._id === attendanceId ? res.data : entry));
            setEditingReasonId(null);
            setEditingReasonValue('');
            toast.success('Leave reason saved');
        } catch (err) {
            console.error(err);
            toast.error('Failed to save leave reason');
        }
        setSavingReasonId(null);
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
            <h1 className="page-title" style={{ margin: 0, border: 'none', marginBottom: '2rem' }}>Daily Progress Logs</h1>

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
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map(entry => {
                                    const date = new Date(entry.date);
                                    const recordedAt = new Date(entry.createdAt || entry.date);
                                    const isEditing = editingReasonId === entry._id;
                                    
                                    return (
                                        <tr key={entry._id}>
                                            <td>{date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                            <td>{date.toLocaleDateString(undefined, { weekday: 'long' })}</td>
                                            <td>
                                                <span style={{
                                                    color: entry.status === 'Present' ? 'var(--success)' : 'var(--danger)',
                                                    fontWeight: 600
                                                }}>
                                                    {entry.status}{entry.autoMarked ? ' (Auto)' : ''}
                                                </span>
                                            </td>
                                            <td>{recordedAt.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                            <td>
                                                {entry.status === 'Present' ? (
                                                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>Daily attendance recorded</span>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Leave reason:</span>
                                                        {isEditing ? (
                                                            <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '200px' }}>
                                                                <input 
                                                                    type="text" 
                                                                    className="form-control"
                                                                    value={editingReasonValue}
                                                                    onChange={e => setEditingReasonValue(e.target.value)}
                                                                    placeholder="Enter leave reason..."
                                                                    style={{ padding: '6px 8px', fontSize: '0.9rem' }}
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveLeaveReason(entry._id)}
                                                                    disabled={savingReasonId === entry._id}
                                                                    style={{
                                                                        padding: '4px 8px',
                                                                        background: 'var(--success)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.75rem',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingReasonId(null)}
                                                                    style={{
                                                                        padding: '4px 8px',
                                                                        background: '#64748b',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.75rem',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ color: entry.leaveReason ? '#cbd5e1' : '#64748b' }}>
                                                                    {entry.leaveReason || 'Not provided'}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingReasonId(entry._id);
                                                                        setEditingReasonValue(entry.leaveReason || '');
                                                                    }}
                                                                    style={{
                                                                        padding: '4px 8px',
                                                                        background: 'var(--primary)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.75rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}
                                                                >
                                                                    <Edit2 size={14} />
                                                                    Add Reason
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
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
