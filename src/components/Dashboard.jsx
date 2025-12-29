import React from 'react';
import { User, LayoutDashboard, FileClock, Activity } from 'lucide-react';


const Dashboard = ({ orders }) => {

    
    const completedWorks = orders ? orders.filter(o => o.status === 'Done' || o.status === 'Shipped' || o.status === 'Delivered').length : 0;
    const pendingWorks = orders ? orders.filter(o => o.status === 'Pending').length : 0;
    const runningWorks = orders ? orders.filter(o => o.status === 'Running').length : 0;

    
    const recentOrders = orders ? orders.filter(o => o.status !== 'Done').sort((a, b) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const dateA = new Date(a.workDays || a.projectDate).getTime();
        const dateB = new Date(b.workDays || b.projectDate).getTime();

        
        const diffA = Math.abs(dateA - today);
        const diffB = Math.abs(dateB - today);

        return diffA - diffB;
    }).slice(0, 3) : [];

    return (
        <div style={styles.container}>

            <div style={styles.titleSection}>
                <h1 style={styles.pageTitle}>Home</h1>
                <div style={styles.titleUnderline}></div>
            </div>
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-info">
                        <div className="stat-icon-box">
                            <LayoutDashboard size={32} />
                        </div>
                        <div className="stat-label">Total Completed<br />works</div>
                    </div>
                    <div className="stat-value" id="totalWorks">{completedWorks}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <div className="stat-icon-box">
                            <FileClock size={32} />
                        </div>
                        <div className="stat-label">Total Pending<br />works</div>
                    </div>
                    <div className="stat-value" id="pendingWorks">{pendingWorks}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <div className="stat-icon-box">
                            <Activity size={32} />
                        </div>
                        <div className="stat-label">Total Running<br />works</div>
                    </div>
                    <div className="stat-value" id="runningWorks">{runningWorks}</div>
                </div>
            </div>

            <div className="recent-section" style={{ marginTop: '20px' }}>
                <h2 style={{ color: '#FFFFFF' }}>Most Recent works</h2>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Location</th>
                                <th style={{ textAlign: 'center' }}>Item qty.</th>
                                <th style={{ textAlign: 'center' }}>Contact no.</th>
                                <th style={{ textAlign: 'center' }}>Project date</th>
                                <th style={{ textAlign: 'center' }}>Work date</th>
                            </tr>
                        </thead>
                        <tbody id="worksTableBody">
                            {recentOrders.map((work) => (
                                <tr key={work.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-icon">
                                                <User size={20} color="#003366" strokeWidth={2} />
                                            </div>
                                            <span>{work.customer}</span>
                                        </div>
                                    </td>
                                    <td>{work.location}</td>
                                    <td style={{ textAlign: 'center' }}>{work.totalQty || 0}</td>
                                    <td style={{ textAlign: 'center' }}>{work.contact}</td>
                                    <td style={{ textAlign: 'center' }}>{work.projectDate}</td>
                                    <td style={{ textAlign: 'center' }}>{work.workDays}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    titleSection: {
        marginBottom: '30px',
        display: 'inline-block',
    },
    pageTitle: {
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '5px',
        color: '#FFFFFF',
    },
    titleUnderline: {
        height: '3px',
        width: '100%',
        backgroundColor: '#0066CC',
        borderRadius: '2px',
    }
};

export default Dashboard;
