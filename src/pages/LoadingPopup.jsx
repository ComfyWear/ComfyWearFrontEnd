import React from 'react';
import '../assets/css/loadingPopup.css';

const LoadingPopup = () => {
    return (
        <div className="loading-popup">
            <div className="loading-spinner"></div>
            <div className="loading-text">This might take a few minutes.</div>
        </div>
    );
};

export default LoadingPopup;