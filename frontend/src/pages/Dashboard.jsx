import { useState, useEffect } from 'react';
import api from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Flame, Shield, Target, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
    const [topics, setTopics] = useState([]);
    const [logs, setLogs] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/topics'), api.get('/logs'), api.get('/attendance')]).then(([resTopics, resLogs, resAttendance]) => {
            setTopics(resTopics.data);
            setLogs(resLogs.data);
            setAttendance(resAttendance.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="loader-container">
            <div className="spinner"></div>
            <div className="loading-text">INITIALIZING COMMAND CENTER...</div>
        </div>
    );

    const totalTopics = topics.length;
    const completedTopics = topics.filter(t => t.status === 'Completed').length;
    const inProgressTopics = topics.filter(t => t.status === 'In Progress').length;
    const progressPercent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

    // Filter logs that are valid study sessions (not missed days)
    const validLogs = logs.filter(l => !l.isMissedDay);

    // Calculate current attendance streak
    const calculateStreak = () => {
        if (attendance.length === 0) return 0;
        
        // Create a map of date strings to attendance status
        const attendanceMap = {};
        attendance.forEach(record => {
            const date = new Date(record.date);
            const dateStr = date.toDateString();
            attendanceMap[dateStr] = record.status;
        });
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        
        // Count consecutive days backwards from today
        // Streak increases only on "Present" days, resets on "Absent" or missing days
        for (let i = 0; i < 365; i++) { // Check up to a year back
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const checkDateStr = checkDate.toDateString();
            
            const status = attendanceMap[checkDateStr];
            
            if (status === 'Present') {
                streak++;
            } else if (status === 'Absent' || status === undefined) {
                // If absent or no record, streak ends
                break;
            }
        }
        
        return streak;
    };

    const currentStreak = calculateStreak();

    // Heatmap Logic (Last 100 Days)
    const getHeatmapData = () => {
        const heatmap = {};
        const today = new Date();
        for (let i = 0; i < 100; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            heatmap[d.toLocaleDateString()] = 0;
        }

        validLogs.forEach(log => {
            const dateStr = new Date(log.date).toLocaleDateString();
            if (heatmap.hasOwnProperty(dateStr)) {
                heatmap[dateStr] += 1;
            }
        });
        return heatmap;
    };

    const heatmapData = getHeatmapData();
    const heatmapDates = Object.keys(heatmapData).sort((a, b) => new Date(a) - new Date(b));

    // Chart data
    const donutData = {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [{
            data: [completedTopics, inProgressTopics, Math.max(0, totalTopics - completedTopics - inProgressTopics)],
            backgroundColor: ['#10b981', '#3b82f6', '#475569'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Mission Command Center</h1>

            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        <Target size={18} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>OVERALL PROGRESS</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }} className="text-gradient">
                        {progressPercent}%
                    </div>
                    <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '10px' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px' }}></div>
                    </div>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        <Shield size={18} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>STUDY STREAK</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }}>
                        {validLogs.length} Sessions
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Total learning events captured</p>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        <Activity size={18} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>DEPLOYED TOPICS</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)' }}>
                        {inProgressTopics}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Currently in active learning</p>
                </div>
            </div>

            {/* ACTIVITY HEATMAP */}
            <div className="glass-panel" style={{ marginBottom: '2rem', padding: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(249, 115, 22, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Flame size={14} style={{ color: '#f97316' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316' }}>
                            Streak: {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <Flame size={24} style={{ color: '#f97316' }} />
                    <h3 style={{ margin: 0 }}>Operational Activity Heatmap</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {heatmapDates.map(date => {
                        const count = heatmapData[date];
                        let color = '#f1f5f9'; // zero
                        if (count === 1) color = '#bbf7d0'; // light green
                        if (count === 2) color = '#4ade80'; // medium
                        if (count > 2) color = '#16a34a'; // dark

                        return (
                            <div
                                key={date}
                                title={`${date}: ${count} activities`}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    background: color,
                                    borderRadius: '2px',
                                    cursor: 'pointer'
                                }}
                            />
                        );
                    })}
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '10px', height: '10px', background: '#f1f5f9' }}></div> Zero
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '10px', height: '10px', background: '#bbf7d0' }}></div> Moderate
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '10px', height: '10px', background: '#16a34a' }}></div> Intense
                    </div>
                </div>
            </div>

            <div className="grid-2">
                <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ width: '100%', marginBottom: '1.5rem', fontWeight: 800 }}>Topic Deployment Status</h3>
                    <div style={{ flex: 1, width: '100%', maxWidth: '300px' }}>
                        <Doughnut data={donutData} options={{ maintainAspectRatio: false, cutout: '75%' }} />
                    </div>
                </div>

                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Mission Analytics</h3>
                    <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                        Your tactical learning pace is currently focused on <strong>{inProgressTopics}</strong> live modules.
                        You have successfully decommissioned <strong>{completedTopics}</strong> topics as completed missions.
                        Keep maintaining your activity heatmap to ensure consistent operational readiness.
                    </p>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{topics.filter(t => t.status === 'Not Started').length}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>BACKLOG</div>
                        </div>
                        <div style={{ flex: 1, background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{completedTopics}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ARCHIVED</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
