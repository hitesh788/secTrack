import { useState, useEffect } from 'react';
import api from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
    const [topics, setTopics] = useState([]);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        Promise.all([api.get('/topics'), api.get('/logs')]).then(([resTopics, resLogs]) => {
            setTopics(resTopics.data);
            setLogs(resLogs.data);
        });
    }, []);

    const totalTopics = topics.length;
    const completedTopics = topics.filter(t => t.status === 'Completed').length;
    const inProgressTopics = topics.filter(t => t.status === 'In Progress').length;
    const progressPercent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

    const totalHours = logs.reduce((sum, log) => sum + log.hoursSpent, 0);

    // Chart data
    const donutData = {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [{
            data: [completedTopics, inProgressTopics, totalTopics - completedTopics - inProgressTopics],
            backgroundColor: ['#10b981', '#3b82f6', '#475569'],
            borderWidth: 0,
        }]
    };

    // Group logs by date for line chart
    const logsByDate = logs.reduce((acc, log) => {
        const date = new Date(log.date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + log.hoursSpent;
        return acc;
    }, {});

    const dates = Object.keys(logsByDate).sort((a, b) => new Date(a) - new Date(b));
    const hoursData = dates.map(d => logsByDate[d]);

    const lineData = {
        labels: dates,
        datasets: [{
            label: 'Hours Studied',
            data: hoursData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
        }]
    };

    return (
        <div>
            <h1 className="page-title">Dashboard</h1>

            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel">
                    <h3 className="text-muted" style={{ fontWeight: 500 }}>Overall Progress</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }} className="text-gradient">
                        {progressPercent}%
                    </div>
                    <p className="text-muted">{completedTopics} of {totalTopics} topics completed</p>
                </div>
                <div className="glass-panel">
                    <h3 className="text-muted" style={{ fontWeight: 500 }}>Total Study Hours</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }} className="text-gradient">
                        {totalHours}
                    </div>
                    <p className="text-muted">Total hours logged</p>
                </div>
                <div className="glass-panel">
                    <h3 className="text-muted" style={{ fontWeight: 500 }}>Topics In Progress</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }} className="text-gradient">
                        {inProgressTopics}
                    </div>
                    <p className="text-muted">Currently learning</p>
                </div>
            </div>

            <div className="grid-2">
                <div className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ width: '100%', marginBottom: '1rem' }}>Topic Status</h3>
                    <div style={{ flex: 1, width: '100%' }}>
                        <Doughnut data={donutData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="glass-panel" style={{ height: '350px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Study Consistency</h3>
                    <div style={{ height: '85%' }}>
                        <Line data={lineData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
