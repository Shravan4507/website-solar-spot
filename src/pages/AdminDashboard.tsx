import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import PageTransition from '../components/effects/PageTransition';
import './AdminDashboard.css';

interface Registration {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    college: string;
    status: 'pending' | 'confirmed' | 'rejected';
    registrationDate: any;
    ticketId: string;
    transactionId: string;
    paymentMethod: 'upi_app' | 'upi_qr' | 'cash';
}

type FilterType = 'all' | 'pending' | 'confirmed' | 'rejected' | 'upi' | 'cash';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [exportOpen, setExportOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/admin-login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "registrations"), orderBy("registrationDate", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Registration[];
            setRegistrations(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching registrations:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: 'confirmed' | 'rejected') => {
        const confirmMsg = `Are you sure you want to ${newStatus.toUpperCase()} this registration?`;
        if (!window.confirm(confirmMsg)) return;
        try {
            const docRef = doc(db, "registrations", id);
            await updateDoc(docRef, { status: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status. Please check permissions.");
        }
    };

    const handleExport = (format: 'csv' | 'excel' | 'json') => {
        const dataToExport = filteredRegs.map(reg => ({
            'First Name': reg.firstName,
            'Last Name': reg.lastName,
            'Email': reg.email,
            'Phone': reg.phone,
            'College': reg.college,
            'Ticket ID': reg.ticketId,
            'Transaction ID': reg.transactionId || 'N/A',
            'Payment Method': reg.paymentMethod,
            'Status': reg.status.toUpperCase(),
            'Registration Date': reg.registrationDate?.toDate ? reg.registrationDate.toDate().toLocaleString() : 'N/A'
        }));

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `SolarSpot_Registrations_${filter}_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        } else if (format === 'csv') {
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `SolarSpot_Registrations_${filter}_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } else if (format === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
            XLSX.writeFile(workbook, `SolarSpot_Registrations_${filter}_${new Date().toISOString().split('T')[0]}.xlsx`);
        }
        setExportOpen(false);
    };

    const filteredRegs = registrations.filter(r => {
        if (filter === 'all') return true;
        if (['pending', 'confirmed', 'rejected'].includes(filter)) return r.status === filter;
        if (filter === 'upi') return r.paymentMethod === 'upi_app' || r.paymentMethod === 'upi_qr';
        if (filter === 'cash') return r.paymentMethod === 'cash';
        return true;
    });

    const stats = {
        total: registrations.length,
        pending: registrations.filter(r => r.status === 'pending').length,
        confirmed: registrations.filter(r => r.status === 'confirmed').length,
        rejected: registrations.filter(r => r.status === 'rejected').length
    };

    return (
        <PageTransition>
            <div className="admin-dashboard">
                <header className="admin-nav">
                    <div className="admin-nav-container">
                        <div className="admin-brand">
                            <span className="brand-glow"></span>
                            MISSION CONTROL • ADMIN
                        </div>
                        <div className="system-metrics">
                            <div className="metrics-labels">
                                <span className="metric">TOTAL: {stats.total}</span>
                                <span className="metric pending">PENDING: {stats.pending}</span>
                                <span className="metric confirmed">CONFIRMED: {stats.confirmed}</span>
                            </div>
                            <div className="admin-actions">
                                <button className="verifier-launch-btn" onClick={() => navigate('/verify')}>
                                    LAUNCH VERIFIER
                                </button>
                                <button className="admin-nav-btn" onClick={() => navigate('/home')}>HOME</button>
                                <button className="admin-logout-btn" onClick={handleLogout}>LOGOUT</button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="admin-content">
                    {/* Mobile Only Metrics Sector */}
                    <div className="mobile-status-hub">
                        <div className="status-item">
                            <span className="label">TOTAL</span>
                            <span className="value">{stats.total}</span>
                        </div>
                        <div className="status-item pending">
                            <span className="label">PENDING</span>
                            <span className="value">{stats.pending}</span>
                        </div>
                        <div className="status-item confirmed">
                            <span className="label">CONFIRMED</span>
                            <span className="value">{stats.confirmed}</span>
                        </div>
                    </div>

                    <section className="controls-bar">
                        <div className="filter-group">
                            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>ALL</button>
                            <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>PENDING</button>
                            <button className={filter === 'confirmed' ? 'active' : ''} onClick={() => setFilter('confirmed')}>CONFIRMED</button>
                            <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>REJECTED</button>
                            <div className="filter-divider"></div>
                            <button className={filter === 'upi' ? 'active' : ''} onClick={() => setFilter('upi')}>UPI</button>
                            <button className={filter === 'cash' ? 'active' : ''} onClick={() => setFilter('cash')}>CASH</button>
                        </div>

                        <div className="export-container">
                            <button className="export-main-btn" onClick={() => setExportOpen(!exportOpen)}>
                                EXPORT DATA ▼
                            </button>
                            {exportOpen && (
                                <div className="export-dropdown">
                                    <button onClick={() => handleExport('csv')}>CSV FORMAT</button>
                                    <button onClick={() => handleExport('excel')}>EXCEL FORMAT</button>
                                    <button onClick={() => handleExport('json')}>JSON FORMAT</button>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="table-container">
                        {loading ? (
                            <div className="loading-state">SYNCING WITH DATABASE...</div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>OBSERVER</th>
                                        <th>CONTACT</th>
                                        <th>METHOD</th>
                                        <th>TICKET ID</th>
                                        <th>TRANSACTION ID</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRegs.map((reg) => (
                                        <motion.tr
                                            key={reg.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <td data-label="OBSERVER">
                                                <div className="user-info">
                                                    <span className="name">{reg.firstName} {reg.lastName}</span>
                                                    <span className="email">{reg.email}</span>
                                                </div>
                                            </td>
                                            <td data-label="CONTACT" className="mono">{reg.phone}</td>
                                            <td data-label="METHOD">
                                                <span className={`method-tag ${reg.paymentMethod}`}>
                                                    {(reg.paymentMethod || 'upi').replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td data-label="TICKET ID" className="mono">{reg.ticketId}</td>
                                            <td data-label="TRANSACTION ID" className="mono">{reg.transactionId || '---'}</td>
                                            <td data-label="STATUS">
                                                <span className={`status-tag ${reg.status}`}>
                                                    {reg.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td data-label="ACTIONS">
                                                <div className="action-buttons">
                                                    {reg.status !== 'confirmed' && (
                                                        <button
                                                            className="btn-approve"
                                                            onClick={() => handleStatusUpdate(reg.id, 'confirmed')}
                                                        >
                                                            APPROVE
                                                        </button>
                                                    )}
                                                    {reg.status !== 'rejected' && (
                                                        <button
                                                            className="btn-reject"
                                                            onClick={() => handleStatusUpdate(reg.id, 'rejected')}
                                                        >
                                                            REJECT
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && filteredRegs.length === 0 && (
                            <div className="empty-state">NO ENTRANTS FOUND IN THIS SECTOR</div>
                        )}
                    </div>
                </main>
            </div>
        </PageTransition>
    );
};

export default AdminDashboard;
