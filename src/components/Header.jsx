import React, { useEffect, useRef } from 'react';
import { Moon, Sun, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoimg from '../assets/product_images/wlight.png';

const Header = ({ isDarkMode, toggleTheme }) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const navRef = useRef(null);
    const sliderRef = useRef(null);
    const linksRef = useRef([]);

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Customers', path: '/customers' },
        { name: 'Orders', path: '/orders' },
        { name: 'Products', path: '/products' },
        { name: 'Calendar', path: '/calendar' },
    ];

    const moveSlider = (element) => {
        if (element && navRef.current && sliderRef.current) {
            const navRect = navRef.current.getBoundingClientRect();
            const elRect = element.getBoundingClientRect();
            const relativeLeft = elRect.left - navRect.left;

            sliderRef.current.style.width = `${elRect.width}px`;
            sliderRef.current.style.left = `${relativeLeft}px`;
            sliderRef.current.style.opacity = '1';
        }
    };

    useEffect(() => {
        const activeIndex = navItems.findIndex(item =>
            item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path)
        );

        if (activeIndex !== -1 && linksRef.current[activeIndex]) {
            moveSlider(linksRef.current[activeIndex]);
        } else if (sliderRef.current) {
            sliderRef.current.style.opacity = '0';
        }
    }, [currentPath]);

    const handleMouseEnter = (e) => {
        moveSlider(e.currentTarget);
    };

    const handleMouseLeave = () => {
        const activeIndex = navItems.findIndex(item =>
            item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path)
        );
        if (activeIndex !== -1 && linksRef.current[activeIndex]) {
            moveSlider(linksRef.current[activeIndex]);
        } else if (sliderRef.current) {
            sliderRef.current.style.opacity = '0';
        }
    };

    return (
        <header style={styles.headerContainer}>
            <div style={styles.header}>
                <div style={styles.logoSection}>
                    <div style={styles.logoCircle}>
                        <img src={logoimg} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    </div>
                </div>

                <nav style={styles.nav} ref={navRef}>
                    {navItems.map((item, index) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            ref={el => linksRef.current[index] = el}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            style={styles.navLink}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div id="underline-slider" ref={sliderRef} style={styles.slider}></div>
                </nav>

                <div style={styles.actions}>
                    <div onClick={toggleTheme} style={styles.icon}>
                        {isDarkMode ? <Sun size={20} color="white" /> : <Moon size={20} color="white" />}
                    </div>
                    {/* Settings icon removed */}
                    <div style={styles.userIconCircle}>
                        <User size={20} color="black" />
                    </div>
                </div>
            </div>
        </header>
    );
};

const styles = {
    headerContainer: {
        padding: '20px 40px',
    },
    header: {
        backgroundColor: '#FF0000',
        borderRadius: '15px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
    },
    logoCircle: {
        width: '40px',
        height: '40px',
        borderRadius: '100%',
        border: '2px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    nav: {
        display: 'flex',
        gap: '30px',
        height: '100%',
        position: 'relative',
    },
    navLink: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: '16px',
        textDecoration: 'none',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5px',

    },
    slider: {
        position: 'absolute',
        bottom: '15px',
        height: '3px',
        backgroundColor: 'black',
        transition: 'all 0.3s ease',
        borderRadius: '2px',
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    icon: {
        cursor: 'pointer',
    },
    userIconCircle: {
        width: '36px',
        height: '36px',
        backgroundColor: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    }
};

export default Header;
