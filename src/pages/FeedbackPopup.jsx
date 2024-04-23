import React from 'react';
import '../assets/css/feedbackPopup.css';

const FeedbackPopup = ({ onClose }) => {
    return (
        <div className="feedback-popup">
            <div className="feedback-popup-content">
                <h3>Please upload an image before sending feedback.</h3>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default FeedbackPopup;