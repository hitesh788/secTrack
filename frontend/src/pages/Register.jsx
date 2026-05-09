import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            alert('Registration failed: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '2.5rem' }}>
                    <ShieldCheck size={36} color="#2563eb" />
                    <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '1px', color: '#1e293b' }}>
                        SECTRACK <span style={{ color: '#2563eb' }}>PRO</span>
                    </span>
                </div>
                <h2 className="text-center" style={{ marginBottom: '2rem' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-control" required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
}
