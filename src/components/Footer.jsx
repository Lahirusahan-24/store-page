import React from 'react';
import logoimg from '../assets/product_images/wlight.png';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.content}>
                <div style={styles.textLeft}>Example Entertainment</div>

                <div style={styles.logoSection}>
                    <div style={styles.logoCircle}>
                        <img src={logoimg} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    </div>
                </div>

                <div style={styles.textRight}>2025 All Right Reserved</div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#1C1C1E',
        color: '#FFFFFF',
        padding: '15px 40px',
        marginTop: 'auto',
    },
    content: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '100%',
    },
    textLeft: {
        fontSize: '14px',
        fontWeight: '500',
    },
    textRight: {
        fontSize: '14px',
        fontWeight: '500',
    },
    logoSection: {
        display: 'flex',
        justifyContent: 'center',
    },
    logoCircle: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        border: '2px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        fontFamily: 'serif',
    },
};

export default Footer;
