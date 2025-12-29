import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";


const Calendar = ({ orders }) => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));
    const [showProjectDates, setShowProjectDates] = useState(true);
    const [showWorkDates, setShowWorkDates] = useState(true);
    const [showOtherEvents, setShowOtherEvents] = useState(true);
    const [otherEvents, setOtherEvents] = useState([]);

    // Popup state
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '' });


    // Fetch events from Firestore
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOtherEvents(eventsData);
        });

        return () => unsubscribe();
    }, []);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getEventsForDate = (day) => {
        if (!orders) return [];
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const events = [];
        orders.forEach(order => {
            if (showProjectDates && order.projectDate === dateStr) {
                events.push({ type: 'project', label: `${order.customer} (Project)`, color: '#0B8043' }); // Green like Google Cal
            }

            if (showWorkDates && order.workDays === dateStr) {
                events.push({ type: 'work', label: `${order.customer} (Work)`, color: '#039BE5' }); // Blue
            }
        });

        if (showOtherEvents) {
            otherEvents.forEach(evt => {
                if (evt.date === dateStr) {
                    events.push({ type: 'other', label: evt.title, color: '#FF0000', id: evt.id }); // Red
                }
            });
        }
        return events;
    };

    const handleCreateEvent = async () => {
        if (!newEvent.title || !newEvent.date) return alert("Please fill details");
        try {
            await addDoc(collection(db, "events"), newEvent);
            setShowCreatePopup(false);
            setNewEvent({ title: '', date: '' });
        } catch (e) {
            console.error("Error adding event: ", e);
            alert("Failed to save event");
        }
    };

    // State for deleting events
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleDeleteEvent = async () => {
        if (selectedEvent && selectedEvent.id) {
            try {
                await deleteDoc(doc(db, "events", selectedEvent.id));
                setSelectedEvent(null);
            } catch (e) {
                console.error("Error deleting event: ", e);
                alert("Failed to delete event");
            }
        }
    };

    return (
        <div style={styles.container}>

            <div style={styles.sidebar}>
                <div style={styles.createBtn} onClick={() => setShowCreatePopup(true)}>
                    <PlusIcon /> <span style={{ marginLeft: '10px' }}>Create</span>
                </div>


                <div style={styles.miniCalendar}>

                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#FFFFFF' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', fontSize: '10px', gap: '5px', color: '#777', textAlign: 'center' }}>
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {Array.from({ length: days }).map((_, i) => <div key={i}>{i + 1}</div>)}
                    </div>
                </div>

                <div style={styles.filterSection}>
                    <h3 style={styles.filterTitle}>My calendars</h3>
                    <div style={styles.filterItem}>
                        <input
                            type="checkbox"
                            checked={showProjectDates}
                            onChange={(e) => setShowProjectDates(e.target.checked)}
                            style={{ accentColor: '#0B8043' }}
                        />
                        <span style={styles.filterLabel}>Project Dates</span>
                    </div>
                    <div style={styles.filterItem}>
                        <input
                            type="checkbox"
                            checked={showWorkDates}
                            onChange={(e) => setShowWorkDates(e.target.checked)}
                            style={{ accentColor: '#039BE5' }}
                        />
                        <span style={styles.filterLabel}>Work Dates</span>
                    </div>
                    <div style={styles.filterItem}>
                        <input
                            type="checkbox"
                            checked={showOtherEvents}
                            onChange={(e) => setShowOtherEvents(e.target.checked)}
                            style={{ accentColor: '#FF0000' }}
                        />
                        <span style={styles.filterLabel}>Other Events</span>
                    </div>
                </div>

            </div>

            <div style={styles.mainContent}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <button style={styles.todayBtn} onClick={() => setCurrentDate(new Date())}>Today</button>
                        <div style={styles.navIcons}>
                            <div onClick={prevMonth} style={styles.navIcon}><ChevronLeft size={20} /></div>
                            <div onClick={nextMonth} style={styles.navIcon}><ChevronRight size={20} /></div>
                        </div>
                        <h2 style={styles.monthTitle}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    </div>
                    <div style={styles.headerRight}>
                    </div>
                </div>


                <div className="calendar-grid-wrapper">
                    <div className="calendar-header-row">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                            <div key={d} className="calendar-header-cell">{d}</div>
                        ))}
                    </div>
                    <div className="calendar-body">

                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="calendar-cell empty"></div>
                        ))}


                        {Array.from({ length: days }).map((_, i) => {
                            const day = i + 1;
                            const events = getEventsForDate(day);
                            return (
                                <div key={day} className="calendar-cell">
                                    <div className="day-number">{day}</div>
                                    <div className="events-list">
                                        {events.map((evt, idx) => (
                                            <div
                                                key={idx}
                                                className="event-card"
                                                style={{ backgroundColor: evt.color, cursor: evt.type === 'other' ? 'pointer' : 'default' }}
                                                onClick={() => {
                                                    if (evt.type === 'other') {
                                                        setSelectedEvent({ ...evt, id: evt.id || otherEvents.find(e => e.title === evt.label)?.id }); // Attempt to find ID if not passed directly. 
                                                        // Actually getEventsForDate constructs new objects. 
                                                        // I need to pass the ID in getEventsForDate.
                                                    }
                                                }}
                                            >
                                                {evt.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Create Popup */}
            {showCreatePopup && (
                <div style={styles.popupOverlay}>
                    <div style={styles.popup}>
                        <div style={styles.popupHeader}>
                            <h3>Create New Event</h3>
                            <div onClick={() => setShowCreatePopup(false)} style={{ cursor: 'pointer' }}>
                                <X size={20} />
                            </div>
                        </div>
                        <div style={styles.popupBody}>
                            <input
                                style={styles.input}
                                placeholder="Event Title"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            />
                            <input
                                style={styles.input}
                                type="date"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            />
                            <button style={styles.saveBtn} onClick={handleCreateEvent}>Save Event</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Popup */}
            {selectedEvent && (
                <div style={styles.popupOverlay}>
                    <div style={styles.popup}>
                        <div style={styles.popupHeader}>
                            <h3>Delete Event?</h3>
                            <div onClick={() => setSelectedEvent(null)} style={{ cursor: 'pointer' }}>
                                <X size={20} />
                            </div>
                        </div>
                        <div style={styles.popupBody}>
                            <p>Are you sure you want to delete <strong>{selectedEvent.label}</strong>?</p>
                            <button
                                style={{ ...styles.saveBtn, backgroundColor: '#FF0000' }}
                                onClick={handleDeleteEvent}
                            >
                                Delete
                            </button>
                            <button
                                style={{ ...styles.saveBtn, backgroundColor: '#ccc', color: '#000' }}
                                onClick={() => setSelectedEvent(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const styles = {
    container: {
        display: 'flex',
        height: 'calc(100vh - 80px)',
        fontFamily: "'Inter', sans-serif",
    },
    sidebar: {
        width: '256px',
        padding: '20px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
    },
    createBtn: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        width: 'fit-content',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        fontWeight: '500',
        color: 'var(--text-main)',
    },
    miniCalendar: {
        marginBottom: '30px',
        color: 'var(--text-main)',
    },
    filterSection: {
        marginTop: '20px',
    },
    filterTitle: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '10px',
    },
    filterItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        gap: '10px',
        cursor: 'pointer',
    },
    filterLabel: {
        fontSize: '14px',
        color: '#FFFFFF',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        color: 'var(--text-main)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    todayBtn: {
        padding: '8px 16px',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        backgroundColor: 'var(--bg-card)',
        cursor: 'pointer',
        fontWeight: '500',
        color: 'var(--text-main)',
    },
    navIcons: {
        display: 'flex',
        gap: '10px',
    },
    navIcon: {
        cursor: 'pointer',
        padding: '5px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
    },
    monthTitle: {
        fontSize: '22px',
        fontWeight: '400',
        color: '#FFFFFF',
    },
    viewSelect: {
        padding: '8px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-main)',
    },
    popupOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    },
    popup: {
        backgroundColor: 'var(--bg-card)',
        padding: '20px',
        borderRadius: '8px',
        width: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        color: 'var(--text-main)',
    },
    popupHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        fontWeight: 'bold',
    },
    popupBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-main)',
    },
    saveBtn: {
        padding: '10px',
        backgroundColor: '#FF0000',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
    }
};

export default Calendar;
