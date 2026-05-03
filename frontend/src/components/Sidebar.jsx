import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Target, BookOpen, Calendar, FileText, LogOut, ShieldCheck, Database, Map, X } from 'lucide-react';

export default function Sidebar({ isOpen, closeSidebar }) {
    const { logout, user } = useAuth();

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo" style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={32} color="#2563eb" />
                    <span style={{ color: 'white' }}>SECTRACK <span style={{ color: '#2563eb' }}>PRO</span></span>
                </div>
                <button
                    onClick={closeSidebar}
                    className="menu-btn"
                    style={{ display: window.innerWidth <= 768 ? 'block' : 'none', color: '#64748b' }}
                >
                    <X size={24} />
                </button>
            </div>

            {user && (
                <div className="profile-section">
                    <div className="profile-avatar">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">{user.name || user.email.split('@')[0]}</span>
                    </div>
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <NavLink to="/" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink to="/goals" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Target size={20} /> Goal Creator
                </NavLink>
                <NavLink to="/topics" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <BookOpen size={20} /> Topics
                </NavLink>
                <NavLink to="/logs" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Calendar size={20} /> Daily Logs
                </NavLink>
                <NavLink to="/vault" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Database size={20} /> Intel Vault
                </NavLink>
                <NavLink to="/roadmaps" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Map size={20} /> Mission Roadmaps
                </NavLink>
                <NavLink to="/reports" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FileText size={20} /> Reports
                </NavLink>
            </div>

            <button onClick={logout} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <LogOut size={20} /> Logout
            </button>
        </div>
    );
}
