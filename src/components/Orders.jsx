import React, { useState } from 'react';
import { Search, Plus, User, ArrowLeft, X, Minus } from 'lucide-react';

import { collection, addDoc, updateDoc, doc, increment } from "firebase/firestore";
import { db } from "../firebase";

const Orders = ({ orders, setOrders, products, setProducts }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [addFormData, setAddFormData] = useState({
        customer: '',
        location: '',
        city: '',
        contact: '',
        projectDate: '',
        workDays: '',
    });
    const [addOrderItems, setAddOrderItems] = useState([
        { id: 1, productId: '', qty: 0 },
        { id: 2, productId: '', qty: 0 },
        { id: 3, productId: '', qty: 0 },
        { id: 4, productId: '', qty: 0 },
        { id: 5, productId: '', qty: 0 },
        { id: 6, productId: '', qty: 0 },
    ]);

    const [editFormData, setEditFormData] = useState({
        customer: '',
        location: '',
        city: '',
        contact: '',
        projectDate: '',
        workDays: '',
    });
    const [editOrderItems, setEditOrderItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [originalItems, setOriginalItems] = useState([]);

    // Handlers for Add Form
    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        setAddFormData({ ...addFormData, [name]: value });
    };

    const handleAddItemChange = (index, field, value) => {
        const newItems = [...addOrderItems];
        newItems[index][field] = value;
        setAddOrderItems(newItems);
    };

    const handleAddQtyChange = (index, delta) => {
        const newItems = [...addOrderItems];
        newItems[index].qty = Math.max(0, newItems[index].qty + delta);
        setAddOrderItems(newItems);
    };

    // Handlers for Edit Form
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleEditItemChange = (index, field, value) => {
        const newItems = [...editOrderItems];
        newItems[index][field] = value;
        setEditOrderItems(newItems);
    };

    const handleEditQtyChange = (index, delta) => {
        const newItems = [...editOrderItems];
        newItems[index].qty = Math.max(0, newItems[index].qty + delta);
        setEditOrderItems(newItems);
    };

    const resetAddForm = () => {
        setAddFormData({
            customer: '',
            location: '',
            city: '',
            contact: '',
            projectDate: '',
            workDays: '',
        });
        setAddOrderItems([
            { id: 1, productId: '', qty: 0 },
            { id: 2, productId: '', qty: 0 },
            { id: 3, productId: '', qty: 0 },
            { id: 4, productId: '', qty: 0 },
            { id: 5, productId: '', qty: 0 },
            { id: 6, productId: '', qty: 0 },
        ]);
    };

    const handleEditClick = (order) => {
        setEditingId(order.id);

        setEditFormData({
            customer: order.customer,
            location: order.location,
            city: order.city || '',
            contact: order.contact,
            projectDate: order.projectDate,
            workDays: order.workDays,
        });

        const loadedItems = [
            { id: 1, productId: '', qty: 0 },
            { id: 2, productId: '', qty: 0 },
            { id: 3, productId: '', qty: 0 },
            { id: 4, productId: '', qty: 0 },
            { id: 5, productId: '', qty: 0 },
            { id: 6, productId: '', qty: 0 },
        ];

        if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item, index) => {
                if (index < 6) {
                    loadedItems[index] = { ...item, id: index + 1 };
                }
            });
        }

        setEditOrderItems(loadedItems);
        setOriginalItems(JSON.parse(JSON.stringify(loadedItems)));
        setShowEditPopup(true);
    };

    const updateOrder = async () => {
        if (!editFormData.customer || !editFormData.location || !editFormData.city || !editFormData.contact || !editFormData.projectDate || !editFormData.workDays) {
            alert("All cells must be filled!");
            return;
        }

        const hasSelectedProduct = editOrderItems.some(item => item.productId !== '');
        if (!hasSelectedProduct) {
            alert("Please select at least one product!");
            return;
        }

        const totalQty = editOrderItems.reduce((acc, item) => acc + (parseInt(item.qty) || 0), 0);

        try {
            const orderRef = doc(db, "orders", editingId);
            const updatedOrder = {
                customer: editFormData.customer,
                location: editFormData.location,
                city: editFormData.city,
                contact: formatContactNumber(editFormData.contact),
                projectDate: editFormData.projectDate,
                workDays: editFormData.workDays,
                totalQty: totalQty,
                items: editOrderItems
            };

            await updateDoc(orderRef, updatedOrder);
            console.log("Order updated with ID: ", editingId);

            // Stock Adjustment
            const stockChanges = {};
            originalItems.forEach(item => {
                if (item.productId) {
                    stockChanges[item.productId] = (stockChanges[item.productId] || 0) - parseInt(item.qty);
                }
            });
            editOrderItems.forEach(item => {
                if (item.productId) {
                    stockChanges[item.productId] = (stockChanges[item.productId] || 0) + parseInt(item.qty);
                }
            });

            for (const [pid, change] of Object.entries(stockChanges)) {
                if (change !== 0) {
                    const prod = products.find(p => p.id === pid);
                    if (prod) {
                        const currentQty = parseInt(prod.qty);
                        const newQty = Math.max(0, currentQty - change).toString();
                        await updateDoc(doc(db, "products", pid), { qty: newQty });
                    }
                }
            }

            setShowEditPopup(false);
            setEditingId(null);
            setOriginalItems([]);
        } catch (e) {
            console.error("Error updating order: ", e);
            alert("Error updating order");
        }
    };

    const formatContactNumber = (input) => {
        let digits = input.replace(/\D/g, '');
        let mobileDigits = '';

        if (digits.length === 10 && digits.startsWith('0')) {
            mobileDigits = digits.substring(1);
        } else if (digits.length === 9 && digits.startsWith('7')) {
            mobileDigits = digits;
        } else if (digits.length === 11 && digits.startsWith('94')) {
            mobileDigits = digits.substring(2);
        } else {
            if (digits.length > 0) return input;
            return input;
        }

        const part1 = mobileDigits.substring(0, 3);
        const part2 = mobileDigits.substring(3, 6);
        const part3 = mobileDigits.substring(6, 10);

        return `+94 ${part1} ${part2} ${part3}`;
    };

    const saveOrder = async () => {
        if (!addFormData.customer || !addFormData.location || !addFormData.city || !addFormData.contact || !addFormData.projectDate || !addFormData.workDays) {
            alert("All cells must be filled!");
            return;
        }

        const formattedContact = formatContactNumber(addFormData.contact);

        const hasSelectedProduct = addOrderItems.some(item => item.productId !== '');
        if (!hasSelectedProduct) {
            alert("Please select at least one product!");
            return;
        }

        const totalQty = addOrderItems.reduce((acc, item) => acc + (parseInt(item.qty) || 0), 0);

        try {
            const newOrder = {
                customer: addFormData.customer,
                location: addFormData.location,
                city: addFormData.city,
                contact: formattedContact,
                projectDate: addFormData.projectDate,
                workDays: addFormData.workDays,
                status: 'Pending',
                totalQty: totalQty,
                items: addOrderItems
            };

            const docRef = await addDoc(collection(db, "orders"), newOrder);
            console.log("Order written with ID: ", docRef.id);

            for (const item of addOrderItems) {
                if (item.productId) {
                    const productToUpdate = products.find(p => p.id === item.productId);
                    if (productToUpdate) {
                        const newQty = Math.max(0, parseInt(productToUpdate.qty) - item.qty).toString();
                        await updateDoc(doc(db, "products", item.productId), { qty: newQty });
                    }
                }
            }

            setShowAddPopup(false);
            resetAddForm();
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error saving order");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const orderRef = doc(db, "orders", id);
            const updateData = { status: newStatus };

            if (newStatus === 'Done') {
                const order = orders.find(o => o.id === id);
                if (order && order.items && order.status !== 'Done') {
                    for (const item of order.items) {
                        const product = products.find(p => p.id === item.productId);
                        if (product) {
                            const newQty = (parseInt(product.qty) + parseInt(item.qty)).toString();
                            await updateDoc(doc(db, "products", item.productId), { qty: newQty });
                        }
                    }
                }
                updateData.totalQty = 0;
            }

            await updateDoc(orderRef, updateData);
        } catch (e) {
            console.error("Error updating status: ", e);
        }
    };

    const resetEditForm = () => {
        setEditFormData({
            customer: '',
            location: '',
            city: '',
            contact: '',
            projectDate: '',
            workDays: '',
        });
        setEditOrderItems([
            { id: 1, productId: '', qty: 0 },
            { id: 2, productId: '', qty: 0 },
            { id: 3, productId: '', qty: 0 },
            { id: 4, productId: '', qty: 0 },
            { id: 5, productId: '', qty: 0 },
            { id: 6, productId: '', qty: 0 },
        ]);
    };

    const [searchQuery, setSearchQuery] = useState("");

    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        // Basic fields
        const basicMatch =
            (order.customer && order.customer.toLowerCase().includes(query)) ||
            (order.location && order.location.toLowerCase().includes(query)) ||
            (order.city && order.city.toLowerCase().includes(query)) ||
            (order.contact && order.contact.toLowerCase().includes(query)) ||
            (order.projectDate && order.projectDate.toLowerCase().includes(query)) ||
            (order.workDays && order.workDays.toLowerCase().includes(query));

        if (basicMatch) return true;

        // Item match
        if (order.items && Array.isArray(order.items)) {
            return order.items.some(item => {
                const product = products.find(p => p.id === item.productId);
                const productName = product ? product.name.toLowerCase() : '';
                const itemQty = String(item.qty);

                return productName.includes(query) || itemQty.includes(query);
            });
        }

        return false;
    });

    return (
        <div style={styles.container}>
            <div style={styles.titleSection}>
                <h1 style={styles.pageTitle}>Orders</h1>
                <div style={styles.titleUnderline}></div>
            </div>

            <div style={styles.controlsBar}>
                <div style={styles.searchWrapper}>
                    <Search size={20} color="#999" style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search Orders"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button style={styles.addButton} onClick={() => setShowAddPopup(true)}>
                    <Plus size={18} color="white" />
                    <span style={styles.addButtonText}>Add Orders</span>
                </button>
            </div>

            <table className="customer-table">
                <tbody>
                    {filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((order) => (
                        <tr key={order.id}>
                            <td>
                                <div style={styles.userIconWrapper}>
                                    <User size={20} color="#000000ff" />
                                </div>
                            </td>

                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{order.customer}</td>
                            <td style={{ textAlign: 'center' }}>{order.location}</td>
                            <td style={{ textAlign: 'center' }}>{order.contact}</td>
                            <td style={{ textAlign: 'center' }}>{order.projectDate}</td>
                            <td style={{ textAlign: 'center' }}>{order.workDays}</td>
                            <td style={{ textAlign: 'center' }}>
                                {order.status === 'Done' ? (
                                    <div style={{
                                        padding: '5px',
                                        borderRadius: '5px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: '#74f874ff',
                                        color: '#000000ff',
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                    }}>
                                        Done
                                    </div>
                                ) : (
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        style={{
                                            padding: '5px',
                                            borderRadius: '5px',
                                            border: '1px solid var(--border-color)',
                                            backgroundColor: order.status === 'Pending' ? '#fff570ff' : order.status === 'Running' ? '#98eeffff' : order.status === 'Done' ? '000000' : order.status === 'Cancelled' ? '#ff6666ff' : '#FF0000',
                                            color: order.status === 'Cancelled' ? 'white' : 'black',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="Pending" style={{ backgroundColor: '#fff570ff', color: '#000000ff' }}>Pending</option>
                                        <option value="Running" style={{ backgroundColor: '#98eeffff', color: '#00d5ffff' }}>Running</option>
                                        <option value="Done" style={{ backgroundColor: '#b2ffb2ff', color: '#00FF00' }}>Done</option>
                                        <option value="Cancelled" style={{ backgroundColor: '#ff9a9aff', color: '#FF0000' }}>Cancelled</option>
                                    </select>
                                )}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                                <button
                                    className="btn-view"
                                    onClick={() => handleEditClick(order)}
                                    disabled={order.status === 'Done'}
                                    style={{
                                        opacity: order.status === 'Done' ? 0.5 : 1,
                                        cursor: order.status === 'Done' ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    Edit
                                </button>
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

                {Array.from({ length: Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) }, (_, i) => (
                    <button
                        key={i + 1}
                        style={currentPage === i + 1 ? styles.activePageBtn : styles.pageBtn}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    style={{ ...styles.pageBtn, opacity: currentPage === Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) ? 0.5 : 1, cursor: currentPage === Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer' }}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)))}
                    disabled={currentPage === Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)}
                >
                    Next
                </button>
            </div>

            {/* Add Order Popup */}
            {showAddPopup && (
                <div style={styles.overlay}>
                    <div style={styles.popup}>
                        <div style={styles.popupHeader}>
                            <div style={styles.backButton} onClick={() => setShowAddPopup(false)}>
                                <ArrowLeft size={24} color="white" />
                            </div>
                            <h2 style={styles.popupTitle}>Add Orders</h2>
                        </div>

                        <div style={styles.popupBody}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Customer Name</label>
                                <input
                                    style={styles.input}
                                    placeholder="Eg -: john Doe"
                                    name="customer"
                                    value={addFormData.customer}
                                    onChange={handleAddInputChange}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Customer Location</label>
                                <input
                                    style={styles.input}
                                    placeholder="Eg -: A/89 California"
                                    name="location"
                                    value={addFormData.location}
                                    onChange={handleAddInputChange}
                                />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>Main City</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Eg -: Colombus"
                                        name="city"
                                        value={addFormData.city}
                                        onChange={handleAddInputChange}
                                    />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>Contact No.</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Eg -: +94 76 123 4567"
                                        name="contact"
                                        value={addFormData.contact}
                                        onChange={handleAddInputChange}
                                    />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>Project Date</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Eg -: dd/mm/yyyy"
                                        name="projectDate"
                                        type="date"
                                        value={addFormData.projectDate}
                                        onChange={handleAddInputChange}
                                    />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>Work Date</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Eg -: dd/mm/yyyy"
                                        name="workDays"
                                        type="date"
                                        value={addFormData.workDays}
                                        onChange={handleAddInputChange}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Add Items</label>
                                <div style={styles.itemsGrid}>
                                    {addOrderItems.map((item, index) => (
                                        <div key={item.id} style={styles.itemRow}>
                                            <select
                                                style={styles.select}
                                                value={item.productId}
                                                onChange={(e) => handleAddItemChange(index, 'productId', e.target.value)}
                                            >
                                                <option value="">Choose Item {item.id}</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <div style={styles.qtyControl}>
                                                <div style={styles.qtyBtn} onClick={() => handleAddQtyChange(index, 1)}>
                                                    <Plus size={12} />
                                                </div>
                                                <div style={styles.qtyValue}>{item.qty}</div>
                                                <div style={styles.qtyBtn} onClick={() => handleAddQtyChange(index, -1)}>
                                                    <Minus size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.popupFooter}>
                                <button style={styles.resetBtn} onClick={resetAddForm}>Reset All</button>
                                <button style={styles.saveBtn} onClick={saveOrder}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Popup */}
            {showEditPopup && (
                <div style={styles.overlay}>
                    <div style={styles.popup}>
                        <div style={styles.popupHeader}>
                            <div style={styles.backButton} onClick={() => setShowEditPopup(false)}>
                                <ArrowLeft size={24} color="white" />
                            </div>
                            <h2 style={styles.popupTitle}>Edit Orders</h2>
                        </div>

                        <div style={styles.popupBody}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Customer Name</label>
                                <input
                                    style={styles.input}
                                    placeholder="Eg -: john Doe"
                                    name="customer"
                                    value={editFormData.customer}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Customer Location</label>
                                <input
                                    style={styles.input}
                                    placeholder="Eg -: A/89 California"
                                    name="location"
                                    value={editFormData.location}
                                    onChange={handleEditInputChange}
                                />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>Main City</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Eg -: Colombus"
                                        name="city"
                                        value={editFormData.city}
                                        onChange={handleEditInputChange}
                                    />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>Contact No.</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Eg -: +94 76 123 4567"
                                        name="contact"
                                        value={editFormData.contact}
                                        onChange={handleEditInputChange}
                                    />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>Project Date</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Eg -: dd/mm/yyyy"
                                        name="projectDate"
                                        type="date"
                                        value={editFormData.projectDate}
                                        onChange={handleEditInputChange}
                                    />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>Work Date</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Eg -: dd/mm/yyyy"
                                        name="workDays"
                                        type="date"
                                        value={editFormData.workDays}
                                        onChange={handleEditInputChange}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Add Items</label>
                                <div style={styles.itemsGrid}>
                                    {editOrderItems.map((item, index) => (
                                        <div key={item.id} style={styles.itemRow}>
                                            <select
                                                style={styles.select}
                                                value={item.productId}
                                                onChange={(e) => handleEditItemChange(index, 'productId', e.target.value)}
                                            >
                                                <option value="">Choose Item {item.id}</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <div style={styles.qtyControl}>
                                                <div style={styles.qtyBtn} onClick={() => handleEditQtyChange(index, 1)}>
                                                    <Plus size={12} />
                                                </div>
                                                <div style={styles.qtyValue}>{item.qty}</div>
                                                <div style={styles.qtyBtn} onClick={() => handleEditQtyChange(index, -1)}>
                                                    <Minus size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.popupFooter}>
                                <button style={{ ...styles.resetBtn, backgroundColor: '#ff4d4d' }} onClick={resetEditForm}>
                                    Clear All
                                </button>
                                <button style={{ ...styles.saveBtn, backgroundColor: '#00FF00' }} onClick={updateOrder}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
    activePageBtn: {
        border: '1px solid #000',
        backgroundColor: 'black',
        color: 'white',
        padding: '5px 15px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        minWidth: '35px',
    },
    dots: {
        fontWeight: 'bold',
        letterSpacing: '2px',
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    popup: {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '20px',
        width: '600px',
        maxWidth: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--text-main)',
    },
    popupHeader: {
        backgroundColor: '#FF0000',
        color: '#ffffff',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
    },
    backButton: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    popupTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'right',
        margin: 0,
    },
    popupBody: {
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontWeight: '600',
        fontSize: '14px',
        color: 'var(--text-main)',
    },
    input: {
        padding: '12px 15px',
        backgroundColor: 'var(--bg-main)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        color: 'var(--text-main)',
    },
    row: {
        display: 'flex',
        gap: '20px',
    },
    col: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    itemsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
    },
    itemRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    select: {
        flex: 1,
        padding: '10px',
        backgroundColor: 'var(--bg-main)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '12px',
        outline: 'none',
        color: 'var(--text-main)',
    },
    qtyControl: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    qtyBtn: {
        backgroundColor: '#002D62',
        color: 'white',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyValue: {
        padding: '0 10px',
        fontSize: '14px',
        fontWeight: 'bold',
        minWidth: '30px',
        textAlign: 'center',
    },
    popupFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
    },
    resetBtn: {
        backgroundColor: '#FF4D4D',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 40px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    saveBtn: {
        backgroundColor: '#00FF40',
        color: 'black',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 60px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
    },

};

export default Orders;
