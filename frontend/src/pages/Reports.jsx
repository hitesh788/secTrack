import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../services/api';
import { FileText, Target, List, Calendar, Download, ShieldCheck, CheckCircle2, AlertTriangle, Clock, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

export default function Reports() {
    const { user } = useAuth();
    const reportRef = useRef();
    const [goals, setGoals] = useState([]);
    const [topics, setTopics] = useState([]);
    const [logs, setLogs] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [gRes, tRes, lRes, aRes] = await Promise.all([
                api.get('/goals'),
                api.get('/topics'),
                api.get('/logs'),
                api.get('/attendance')
            ]);
            setGoals(gRes.data);
            setTopics(tRes.data);
            setLogs(lRes.data);
            setAttendance(aRes.data);
        } catch (error) {
            console.error('Error fetching report data', error);
        }
        setLoading(false);
    };

    const handleGeneratePdf = async () => {
        const element = reportRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        const data = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const userName = user?.name || user?.email?.split('@')[0] || 'User';
        pdf.save(`${userName}_SecTrack_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Operational report generated and downloaded.');
    };

    if (loading) return (
        <div className="loader-container">
            <div className="spinner"></div>
            <div className="loading-text">GENERATING COMPREHENSIVE INTELLIGENCE...</div>
        </div>
    );

    const todayTopics = topics.filter(t => (t.targetDate === 'Today' || (!t.targetDate && t.status === 'In Progress')) && t.status !== 'Completed');
    const tomorrowTopics = topics.filter(t => (t.targetDate === 'Tomorrow' || (!t.targetDate && t.status === 'Not Started')) && t.status !== 'Completed');
    const completedTopics = topics.filter(t => t.status === 'Completed');

    const formatCompletionDate = (topic) => {
        const dateValue = topic.completedAt || topic.updatedAt;
        return dateValue ? new Date(dateValue).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null;
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0, border: 'none' }}>Detailed Progress Reports</h1>
                <button className="btn btn-primary" onClick={handleGeneratePdf} style={{ display: 'flex', gap: '8px' }}>
                    <Download size={18} /> Download official PDF
                </button>
            </div>

            <div ref={reportRef} className="report-paper">
                {/* BRANDING HEADER */}
                <div className="report-header-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--sidebar-bg)', marginBottom: '8px' }}>
                            <ShieldCheck size={32} />
                            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px' }}>SECTRACK <span style={{ color: 'var(--primary)' }}>PRO</span></h1>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Comprehensive Security Learning Analytics</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '4px', textTransform: 'uppercase' }}>OPERATIVE: {user?.name || user?.email.split('@')[0]}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>REPORT ID: {user?._id?.toUpperCase().slice(-10) || 'SEC-OFFICIAL'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>DATED: {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>

                {/* 1. GOALS SECTION */}
                <div style={{ marginBottom: '3rem' }}>
                    <div className="report-section-header">
                        <Target size={20} /> 1. Strategic Learning Goals
                    </div>
                    {goals.length === 0 ? <p style={{ padding: '1rem', color: '#94a3b8' }}>No active goals documented in this period.</p> : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {goals.map(g => (
                                <div key={g._id} className="report-info-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '1rem', flexWrap: 'wrap' }}>
                                        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>{g.title}</h4>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>START: {g.startDate ? new Date(g.startDate).toLocaleDateString() : 'N/A'}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>TARGET: {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>{g.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. TOPIC PLANNER SECTION */}
                <div style={{ marginBottom: '3rem' }}>
                    <div className="report-section-header">
                        <List size={20} /> 2. Topic Planner execution
                    </div>

                    <div className="grid-2" style={{ gap: '2rem' }}>
                        <div>
                            <h5 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={14} /> Active Today
                            </h5>
                            {todayTopics.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>No topics active today.</p> : (
                                <ul style={{ padding: 0, listStyle: 'none' }}>
                                    {todayTopics.map(t => (
                                        <li key={t._id} style={{ fontSize: '0.9rem', padding: '6px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                                            <CornerRightDown size={14} style={{ color: 'var(--primary)', marginTop: '4px' }} /> {t.title}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <h5 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Mastered Topics
                            </h5>
                            <div style={{ maxHeight: '200px', overflow: 'hidden' }}>
                                {completedTopics.slice(0, 8).map(t => {
                                    const completionDate = formatCompletionDate(t);
                                    return (
                                        <div key={t._id} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                            ✓ {t.title}{completionDate ? ` — ${completionDate}` : ''}
                                        </div>
                                    );
                                })}
                                {completedTopics.length > 8 && <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>+ {completedTopics.length - 8} more topics</div>}
                                {completedTopics.length === 0 && <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>None completed yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. LOGS TABLE SECTION */}
                <div style={{ marginBottom: '3rem' }}>
                    <div className="report-section-header">
                        <Calendar size={20} /> 3. Detailed Progress Ledger
                    </div>
                    {logs.length === 0 ? <p style={{ padding: '1rem', color: '#94a3b8' }}>No activity logs found for ledger generation.</p> : (
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>DATE</th>
                                    <th>ACTIVITY TYPE</th>
                                    <th>TOPIC / MILESTONE</th>
                                    <th>REMARKS / NOTES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log._id}>
                                        <td style={{ fontWeight: 600 }}>{new Date(log.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</td>
                                        <td>
                                            {log.isMissedDay
                                                ? <span className="report-badge" style={{ background: '#fef2f2', color: '#b91c1c' }}>Missed Day</span>
                                                : <span className="report-badge" style={{ background: '#f0fdf4', color: '#166534' }}>Study Session</span>}
                                        </td>
                                        <td style={{ fontWeight: 500, color: '#0f172a' }}>
                                            {log.isMissedDay ? 'System Leave' : log.completedTasks}
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            {log.isMissedDay ? log.reasonMissed : log.notes}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* 4. ATTENDANCE SECTION */}
                <div style={{ marginBottom: '3rem' }}>
                    <div className="report-section-header">
                        <User size={20} /> 4. Daily Attendance Record
                    </div>
                    {attendance.length === 0 ? <p style={{ padding: '1rem', color: '#94a3b8' }}>No attendance records found for this period.</p> : (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))', gap: '4px', marginTop: '1rem' }}>
                                {attendance
                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                    .slice(-30)
                                    .map(entry => {
                                    const date = new Date(entry.date);
                                    const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
                                    const dayNumber = date.getDate();
                                    const monthName = date.toLocaleDateString(undefined, { month: 'short' }).toLowerCase();

                                    return (
                                        <div
                                            key={entry._id}
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '4px',
                                                padding: '4px',
                                                textAlign: 'center',
                                                backgroundColor: entry.status === 'Present' ? '#f0fdf4' : '#fef2f2',
                                                borderColor: entry.status === 'Present' ? '#bbf7d0' : '#fecaca'
                                            }}
                                        >
                                            <div style={{
                                                fontSize: '0.5rem',
                                                fontWeight: 600,
                                                color: entry.status === 'Present' ? '#166534' : '#b91c1c',
                                                marginBottom: '1px'
                                            }}>
                                                {dayName}
                                            </div>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                fontWeight: 700,
                                                color: entry.status === 'Present' ? '#166534' : '#b91c1c',
                                                marginBottom: '1px'
                                            }}>
                                                {dayNumber}
                                            </div>
                                            <div style={{
                                                fontSize: '0.45rem',
                                                color: entry.status === 'Present' ? '#166534' : '#b91c1c',
                                                fontWeight: 500
                                            }}>
                                                {monthName}
                                            </div>
                                            {entry.autoMarked && (
                                                <div style={{
                                                    fontSize: '0.45rem',
                                                    color: entry.status === 'Present' ? '#166534' : '#b91c1c',
                                                    marginTop: '1px'
                                                }}>
                                                    Auto
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {attendance.length > 30 && (
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem', textAlign: 'center' }}>
                                    Showing last 30 attendance records. Total: {attendance.length} days
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        This is an automated report from SecTrack Pro.
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>PAGE 01 / 01</div>
                </div>
            </div>
        </div>
    );
}

const CornerRightDown = ({ size, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <polyline points="15 10 20 15 15 20" />
        <path d="M4 4v7a4 4 0 0 0 4 4h12" />
    </svg>
);
