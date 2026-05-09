import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import GoalCreator from './pages/GoalCreator';
import TopicManager from './pages/TopicManager';
import DailyLogs from './pages/DailyLogs';
import Reports from './pages/Reports';
import ResourceVault from './pages/ResourceVault';
import RoadmapCenter from './pages/RoadmapCenter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, BookOpen, Calendar, Database, Map, FileText, ShieldCheck, LogOut } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
          <ShieldCheck size={24} color="#2563eb" />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px' }}>SECTRACK <span style={{ color: '#2563eb' }}>PRO</span></span>
        </div>
        <button
          onClick={logout}
          className="btn-logout-mobile"
          style={{ background: 'transparent', border: 'none', color: '#f87171', padding: '5px', cursor: 'pointer' }}
        >
          <LogOut size={20} />
        </button>
      </header>

      <Sidebar />

      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Navbar */}
      <nav className="mobile-nav">
        <NavLink to="/" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/goals" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <Target size={20} />
          <span>Goals</span>
        </NavLink>
        <NavLink to="/topics" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Topics</span>
        </NavLink>
        <NavLink to="/logs" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Logs</span>
        </NavLink>
        <NavLink to="/vault" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <Database size={20} />
          <span>Vault</span>
        </NavLink>
      </nav>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
          <Route path="/goals" element={<PrivateRoute><AppLayout><GoalCreator /></AppLayout></PrivateRoute>} />
          <Route path="/topics" element={<PrivateRoute><AppLayout><TopicManager /></AppLayout></PrivateRoute>} />
          <Route path="/logs" element={<PrivateRoute><AppLayout><DailyLogs /></AppLayout></PrivateRoute>} />
          <Route path="/vault" element={<PrivateRoute><AppLayout><ResourceVault /></AppLayout></PrivateRoute>} />
          <Route path="/roadmaps" element={<PrivateRoute><AppLayout><RoadmapCenter /></AppLayout></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><AppLayout><Reports /></AppLayout></PrivateRoute>} />
        </Routes>
        <ToastContainer position="bottom-right" theme="dark" />
      </Router>
    </AuthProvider>
  );
}

export default App;
