import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Dashboard from './Dashboard'; // Re-use dashboard charts

export default function Reports() {
    const reportRef = useRef();

    const handleGeneratePdf = async () => {
        const element = reportRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const data = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('SecTrack_Pro_Report.pdf');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Progress Report</h1>
                <button className="btn btn-primary" onClick={handleGeneratePdf}>
                    Download PDF
                </button>
            </div>

            <div ref={reportRef} style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }} className="text-gradient">Security Learning Progress Report</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Generated on {new Date().toLocaleDateString()}</p>

                <Dashboard />
            </div>
        </div>
    );
}
