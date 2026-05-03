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

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/goals" element={<PrivateRoute><AppLayout><GoalCreator /></AppLayout></PrivateRoute>} />
      <Route path="/topics" element={<PrivateRoute><AppLayout><TopicManager /></AppLayout></PrivateRoute>} />
      <Route path="/logs" element={<PrivateRoute><AppLayout><DailyLogs /></AppLayout></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><AppLayout><Reports /></AppLayout></PrivateRoute>} />
      <Route path="/vault" element={<PrivateRoute><AppLayout><ResourceVault /></AppLayout></PrivateRoute>} />
      <Route path="/roadmaps" element={<PrivateRoute><AppLayout><RoadmapCenter /></AppLayout></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
          pauseOnHover={false}
          pauseOnFocusLoss={false}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
