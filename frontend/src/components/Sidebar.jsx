import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Target, BookOpen, Calendar, FileText, LogOut, Shield } from 'lucide-react';

export default function Sidebar() {
    const { logout } = useAuth();

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <Shield size={28} />
                SecTrack Pro
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink to="/goals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Target size={20} /> Goal Creator
                </NavLink>
                <NavLink to="/topics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <BookOpen size={20} /> Topics
                </NavLink>
                <NavLink to="/logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Calendar size={20} /> Daily Logs
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FileText size={20} /> Reports
                </NavLink>
            </div>

            <button onClick={logout} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <LogOut size={20} /> Logout
            </button>
        </div>
    );
}
