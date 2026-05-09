import { useState, useEffect } from 'react';
import api from '../services/api';
import { Map, Plus, Trash2, FileText, Upload, Search, Layout, FileType, ExternalLink, X, Maximize2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

export default function RoadmapCenter() {
    const [roadmaps, setRoadmaps] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState('Career');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Preview State
    const [previewFile, setPreviewFile] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const fetchRoadmaps = async () => {
        setLoading(true);
        try {
            const res = await api.get('/roadmaps');
            setRoadmaps(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.warning('Please select a strategic blueprint file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('roadmapFile', file);

        setLoading(true);
        try {
            const res = await api.post('/roadmaps', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setRoadmaps([res.data, ...roadmaps]);
            setTitle('');
            setDescription('');
            setFile(null);
            // Reset file input
            e.target.reset();
            toast.success('Operational blueprint archived successfully!');
        } catch (err) {
            console.error('Upload error:', err.response?.data || err);
            toast.error(err.response?.data?.message || 'Failed to archive blueprint. Size might be too large.');
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
            await api.delete(`/roadmaps/${deleteId}`);
            setRoadmaps(roadmaps.filter(r => r._id !== deleteId));
            toast.info('Blueprint purged from archives.');
        } catch (err) {
            toast.error('Failed to purge blueprint.');
        }
    };

    const filteredRoadmaps = roadmaps.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFileIcon = (type) => {
        if (type?.includes('pdf')) return <FileText size={40} style={{ color: '#ef4444' }} />;
        if (type?.includes('image')) return <Layout size={40} style={{ color: '#3b82f6' }} />;
        return <FileType size={40} style={{ color: '#64748b' }} />;
    };

    if (loading && roadmaps.length === 0) return (
        <div className="loader-container">
            <div className="spinner"></div>
            <div className="loading-text">RETRIEVING MISSION BLUEPRINTS...</div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ margin: 0, border: 'none' }}>Roadmap Center</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            className="form-control"
                            style={{ paddingLeft: '2.5rem', width: '300px' }}
                            placeholder="Search blueprints..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ gridTemplateColumns: '400px 1fr' }}>
                {/* UPLOAD FORM */}
                <div className="goal-form-panel" style={{ height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <Upload size={24} />
                        <h3 style={{ margin: 0 }}>Archive New Blueprint</h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Blueprint Title</label>
                            <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Zero to Hero SOC Path" />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="Career">Career Paths</option>
                                <option value="Technical">Technical Skills</option>
                                <option value="Certification">Certifications</option>
                                <option value="Training">Training PDF</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Select File (PDF, Image, Doc)</label>
                            <input type="file" className="form-control" onChange={handleFileChange} required style={{ paddingTop: '8px' }} />
                            <small style={{ color: '#94a3b8', marginTop: '4px', display: 'block' }}>Max size: 10MB</small>
                        </div>
                        <div className="form-group">
                            <label>Instructional Notes</label>
                            <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="Brief summary of this blueprint..." />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                            {loading ? 'Archiving...' : <><Map size={18} /> Upload Blueprint</>}
                        </button>
                    </form>
                </div>

                {/* ARCHIVE GALLERY */}
                <div className="log-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {filteredRoadmaps.map(r => (
                        <div key={r._id} className="log-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(37, 99, 235, 0.05)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {getFileIcon(r.fileType)}
                                </div>
                                <button onClick={() => confirmDelete(r._id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }} className="hover-danger">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span className="badge" style={{ fontSize: '0.65rem' }}>{r.category}</span>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 style={{ margin: '0 0 8px 0', fontWeight: 800 }}>{r.title}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                    {r.description || 'Secure technical blueprint for mission execution.'}
                                </p>
                                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    FILE: {r.fileName}
                                </div>
                            </div>

                            <a
                                href={`/_/backend${r.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline"
                                style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
                            >
                                <ExternalLink size={14} /> View Blueprint
                            </a>
                        </div>
                    ))}
                    {filteredRoadmaps.length === 0 && (
                        <div className="glass-panel" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', borderStyle: 'dashed' }}>
                            <Upload size={48} className="text-muted" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p className="text-muted">No blueprints in current archives. Start uploading your mission paths.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Purge Blueprint?"
                message="This will permanently delete this operational file from the server archives. This action is final."
            />
        </div>
    );
}
