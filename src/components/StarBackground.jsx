import React, { useMemo } from 'react';
import './StarBackground.css';

const StarBackground = () => {
    const generateBoxShadow = (n) => {
        let value = `${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
        for (let i = 2; i <= n; i++) {
            value += `, ${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
        }
        return value;
    };

    const shadows = useMemo(() => ({
        '--shadow-small': generateBoxShadow(700),
        '--shadow-medium': generateBoxShadow(200),
        '--shadow-big': generateBoxShadow(100),
    }), []);

    return (
        <div className="star-wrapper" style={shadows}>
            <div id="stars"></div>
            <div id="stars2"></div>
            <div id="stars3"></div>
        </div>
    );
};

export default StarBackground;
