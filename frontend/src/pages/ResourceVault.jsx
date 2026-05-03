import { useState, useEffect } from 'react';
import api from '../services/api';
import { Folder, Link as LinkIcon, Plus, Trash2, Database, Search, FolderPlus, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

export default function ResourceVault() {
    const [resources, setResources] = useState([]);
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [category, setCategory] = useState('General');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await api.get('/resources');
            setResources(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/resources', { title, link, category, notes });
            setResources([res.data, ...resources]);
            setTitle('');
            setLink('');
            setNotes('');
            toast.success('Intelligence record stored in vault.');
        } catch (err) {
            toast.error('Failed to store intelligence record.');
        }
        setLoading(false);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/resources/${deleteId}`);
            setResources(resources.filter(r => r._id !== deleteId));
            toast.info('Intelligence record purged from vault.');
        } catch (err) {
            toast.error('Failed to purge record.');
        }
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = ['General', 'Documentation', 'Tools', 'Exploits', 'Training', 'Certifications'];

    // Grouping for "Folder" view
    const grouped = filteredResources.reduce((acc, r) => {
        const cat = r.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(r);
        return acc;
    }, {});

    if (loading && resources.length === 0) return (
        <div className="loader-container">
            <div className="spinner"></div>
            <div className="loading-text">ACCESSING INTELLIGENCE VAULT...</div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ margin: 0, border: 'none' }}>Intel Repository</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            className="form-control"
                            style={{ paddingLeft: '2.5rem', width: '300px' }}
                            placeholder="Search intel..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ gridTemplateColumns: '380px 1fr' }}>
                {/* ADD NEW INTEL FORM */}
                <div className="goal-form-panel" style={{ height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <FolderPlus size={24} />
                        <h3 style={{ margin: 0 }}>Add New Intelligence</h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Intel Title</label>
                            <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Nmap Cheat Sheet" />
                        </div>
                        <div className="form-group">
                            <label>Folder / Category</label>
                            <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>External Link (URL)</label>
                            <input className="form-control" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="form-group">
                            <label>Tactical Notes</label>
                            <textarea className="form-control" value={notes} onChange={e => setNotes(e.target.value)} rows="3" placeholder="Brief summary or access keys..." />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                            <Database size={18} /> Store in Vault
                        </button>
                    </form>
                </div>

                {/* REPOSITORY VIEW */}
                <div>
                    {Object.keys(grouped).length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem', borderStyle: 'dashed' }}>
                            <Database size={48} className="text-muted" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p className="text-muted">Repository is empty. Start storing tactical intel.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {Object.entries(grouped).map(([cat, items]) => (
                                <div key={cat}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <Folder size={20} className="text-gradient" />
                                        <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem' }}>{cat} ({items.length})</h3>
                                    </div>
                                    <div className="log-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                        {items.map(res => (
                                            <div key={res._id} className="log-card" style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <h4 style={{ margin: 0, fontWeight: 700 }}>{res.title}</h4>
                                                    <button onClick={() => confirmDelete(res._id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }} className="hover-danger">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                {res.notes && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{res.notes}</p>}
                                                {res.link && (
                                                    <a
                                                        href={res.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-outline"
                                                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'flex-start', background: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                    >
                                                        <LinkIcon size={14} /> {new URL(res.link.startsWith('http') ? res.link : `https://${res.link}`).hostname}
                                                    </a>
                                                )}
                                                {!res.link && (
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FileText size={12} /> Local Reference Only
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Purge Intel Record?"
                message="This will permanently delete this intelligence record from the vault. This action is irreversible."
            />
        </div>
    );
}
