import React, { useState } from 'react';
import { Search, Plus, User, ArrowUpDown, ChevronDown } from 'lucide-react';

const Customers = ({ orders }) => {
    // Derive unique customers from orders
    // Use a Map to filter by customer name, keeping the latest details
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const uniqueCustomersMap = new Map();
    if (orders) {
        orders.forEach(order => {
            if (order.contact) { // Group by Contact Number
                if (!uniqueCustomersMap.has(order.contact)) {
                    uniqueCustomersMap.set(order.contact, {
                        id: order.id,
                        name: order.customer, // Keep the name from the first encountered order (or latest if we updated logic)
                        location: order.location,
                        city: order.city || '',
                        contact: order.contact,
                        projectDates: [],
                        totalWorks: 0
                    });
                }
                const customer = uniqueCustomersMap.get(order.contact);
                customer.totalWorks += 1;
                if (order.projectDate) {
                    customer.projectDates.push(order.projectDate);
                }
                // Optional: Update name to latest if needed, but keeping simple for now
            }
        });
    }

    const customers = Array.from(uniqueCustomersMap.values()).map(c => {
        // Sort dates descending
        c.projectDates.sort((a, b) => b.localeCompare(a));
        c.lastProjectDate = c.projectDates[0] || 'N/A';
        return c;
    });

    const sortedCustomers = [...customers].sort((a, b) => {
        if (sortConfig.key === 'name') {
            return sortConfig.direction === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        if (sortConfig.key === 'date') {
            // Sort by lastProjectDate
            const dateA = a.lastProjectDate === 'N/A' ? '' : a.lastProjectDate;
            const dateB = b.lastProjectDate === 'N/A' ? '' : b.lastProjectDate;
            return sortConfig.direction === 'asc'
                ? dateA.localeCompare(dateB)
                : dateB.localeCompare(dateA);
        }
        return 0;
    });

    const [searchQuery, setSearchQuery] = useState("");

    const filteredCustomers = sortedCustomers.filter(customer => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        return (
            (customer.name && customer.name.toLowerCase().includes(query)) ||
            (customer.location && customer.location.toLowerCase().includes(query)) ||
            (customer.city && customer.city.toLowerCase().includes(query)) ||
            (customer.contact && customer.contact.toLowerCase().includes(query))
        );
    });

    return (
        <div style={styles.container}>
            <div style={styles.titleSection}>
                <h1 style={styles.pageTitle}>Customer</h1>
                <div style={styles.titleUnderline}></div>
            </div>

            <div style={styles.controlsBar}>
                <div style={styles.searchWrapper}>
                    <Search size={20} color="#999" style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search Customer"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <button
                        style={{ ...styles.addButton, backgroundColor: '#f0f0f0', color: 'black', border: '1px solid #ddd' }}
                        onClick={() => setIsSortOpen(!isSortOpen)}
                    >
                        <ArrowUpDown size={18} color="black" />
                        <span style={{ ...styles.addButtonText, color: 'black' }}>Sort By</span>
                        <ChevronDown size={14} color="black" />
                    </button>

                    {isSortOpen && (
                        <div style={styles.sortDropdown}>
                            <div style={styles.sortSection}>
                                <div style={styles.sortLabel}>Type</div>
                                <div
                                    style={{ ...styles.sortOption, backgroundColor: sortConfig.key === 'name' ? '#e6f0ff' : 'transparent' }}
                                    onClick={() => setSortConfig({ ...sortConfig, key: 'name' })}
                                >
                                    Name by
                                </div>
                                <div
                                    style={{ ...styles.sortOption, backgroundColor: sortConfig.key === 'date' ? '#e6f0ff' : 'transparent' }}
                                    onClick={() => setSortConfig({ ...sortConfig, key: 'date' })}
                                >
                                    Date by
                                </div>
                            </div>
                            <div style={{ ...styles.sortSection, borderTop: '1px solid #eee' }}>
                                <div style={styles.sortLabel}>Order</div>
                                <div
                                    style={{ ...styles.sortOption, backgroundColor: sortConfig.direction === 'asc' ? '#e6f0ff' : 'transparent' }}
                                    onClick={() => setSortConfig({ ...sortConfig, direction: 'asc' })}
                                >
                                    Ascending
                                </div>
                                <div
                                    style={{ ...styles.sortOption, backgroundColor: sortConfig.direction === 'desc' ? '#e6f0ff' : 'transparent' }}
                                    onClick={() => setSortConfig({ ...sortConfig, direction: 'desc' })}
                                >
                                    Descending
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <table className="customer-table">
                <tbody>
                    {filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((customer, index) => (
                        <tr key={customer.id || index}>
                            <td>
                                <div style={styles.userIconWrapper}>
                                    <User size={20} color="#000000ff" />
                                </div>
                            </td>

                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{customer.name}</td>
                            <td style={{ textAlign: 'center' }}>{customer.location}</td>
                            <td style={{ textAlign: 'center' }}>{customer.city}</td>
                            <td style={{ textAlign: 'center' }}>{customer.contact}</td>
                            <td style={{ textAlign: 'center' }}>{customer.lastProjectDate}</td>
                            <td style={{ textAlign: 'center' }}>
                                <span style={{
                                    backgroundColor: '#e6f0ff',
                                    color: '#0066CC',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    {customer.totalWorks} Works
                                </span>
                            </td>


                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={styles.pagination}>
                <button
                    style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>

                {Array.from({ length: Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) }, (_, i) => (
                    <button
                        key={i + 1}
                        style={{ ...styles.pageBtn, backgroundColor: currentPage === i + 1 ? '#000000ff' : 'var(--bg-card)', color: currentPage === i + 1 ? 'white' : 'var(--text-main)', border: currentPage === i + 1 ? '1px solid #000' : '1px solid var(--border-color)' }}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    style={{ ...styles.pageBtn, opacity: currentPage === Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) ? 0.5 : 1, cursor: currentPage === Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer' }}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE)))}
                    disabled={currentPage === Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
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
    },
    controlsBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    searchWrapper: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '10px 15px',
        width: '300px',
    },
    searchIcon: {
        marginRight: '10px',
    },
    searchInput: {
        border: 'none',
        outline: 'none',
        width: '100%',
        fontSize: '14px',
        color: 'var(--text-main)',
        backgroundColor: 'transparent',
    },
    addButton: {
        backgroundColor: '#0044CC',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    addButtonText: {
        fontWeight: '600',
        fontSize: '14px',
    },
    userIconWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '40px',
        gap: '10px',
    },
    pageBtn: {
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-main)',
        padding: '5px 15px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        minWidth: '35px',
    },
    dots: {
        fontWeight: 'bold',
        letterSpacing: '2px',
        color: 'var(--text-main)',
    },
    sortDropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 100,
        minWidth: '150px',
        marginTop: '5px',
        padding: '5px 0',
    },
    sortSection: {
        padding: '5px 0',
    },
    sortLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#999',
        padding: '5px 15px',
        textTransform: 'uppercase',
    },
    sortOption: {
        padding: '8px 15px',
        fontSize: '14px',
        cursor: 'pointer',
        color: 'var(--text-main)',
        transition: 'background-color 0.2s',
    },
};

export default Customers;
