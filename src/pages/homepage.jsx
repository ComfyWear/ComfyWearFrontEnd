import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/homepage.css'; // Assuming you named your CSS file homepage.css
import rightImage from '../assets/images/Component 1-3.png'; // Assuming you named your image right-image.png

const HomePage = () => {
    const navigate = useNavigate();

    const handlePredictionClick = () => {
        navigate('/prediction');
    }

    const handleStatisticClick = () => {
        navigate('/statistics');
    }

    return (
        <div className="homepageBackground">
            <div className="leftContainer">
                <div className="comfy">COMFY</div>
                <div className="wear">WEAR</div>
                <div className="link-box">
                    <div className="rectangle1" onClick={handlePredictionClick}>
                        <div className='headline'>PREDICTION</div>
                        <div className='detail'>Get your comfort level from the prediction</div>
                    </div>
                    <div className="rectangle2" onClick={handleStatisticClick}>
                        <div className='headline'>STATISTIC</div>
                        <div className='detail'>View our statistic from data collection</div>
                    </div>
                </div>
            </div>
            <div className="rightContainer">
                <img src={rightImage} alt="Right Side" />
            </div>

        </div>
    );
};

export default HomePage;
