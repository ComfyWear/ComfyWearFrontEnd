import React, { useState, useRef } from 'react';
import '../assets/css/prediction.css';
import { Button, Switch } from '@mui/material';

const Prediction = () => {
    const [comfortLevel, setComfortLevel] = useState('');
    const [isToggled, setIsToggled] = useState(false);
    const [image, setImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleComfortChange = (event) => {
        setComfortLevel(event.target.value);
    };

    const handleToggleChange = (event) => {
        setIsToggled(event.target.checked);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
        event.target.value = null; // Reset the input value after the file is read
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="predictBackground">
            <div className="predictLeftContainer">
                <div className="imageBox">
                    <div className='imageContainer'>
                    {image ? (
                        <img src={image} alt="Uploaded" style={{maxWidth: '745px', maxHeight: '383px', borderRadius: '10px' }} />
                    ) : (
                        <div style={{ color: 'white', textAlign: 'center' }}>UPLOAD IMAGE</div>
                    )}
                    </div>
                    <div className="uploadButton" style={{ textAlign: 'center' }}>
                        <input type="file" id="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                        <Button
                            variant="contained"
                            onClick={handleButtonClick}
                            sx={{
                                width: 175,
                                height: 23,
                                backgroundColor: '#ffe178',
                                color: '#0E2E5F',
                                borderRadius: 5,
                                fontSize: '10px',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: 'white',
                                },
                            }}
                        >
                            CLICK TO UPLOAD IMAGE
                        </Button>
                    </div>
                </div>

                <div className="predictBox">
                    <div className='llContainer'>
                        <div className='llText' id='current'>YOUR CURRENT COMFORT</div>
                        <div className='selectLine'>
                            <select value={comfortLevel} onChange={handleComfortChange} className="llComboBox">
                                <option value="">Rate your current comfort level</option>
                                <option value="Too humid">Too humid</option>
                                <option value="neutral">Too dry</option>
                                <option value="uncomfortable">Too cold</option>
                                <option value="uncomfortable">Too warm</option>
                                <option value="uncomfortable">Comfortable</option>
                            </select>
                            <Button
                                variant="contained"
                                sx={{
                                    width: 130,
                                    height: 23,
                                    marginTop: 1.2,
                                    marginLeft: 1,
                                    backgroundColor: '#3384FF',
                                    color: 'white',
                                    borderRadius: 2,
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: 'white',
                                    },
                                }}
                            >
                                SEND FEEDBACK
                            </Button>
                        </div>
                        <div className='llText' id='advice'>Advice to get more comfort</div>
                        <div className='llText' id='adviceDescription'>Wear a light jacket</div>
                    </div>
                    <div className='lineVertical'></div>
                    <div className='lrContainer'>
                        <div className='selectLineSwitch'>
                            <div className='llText' id='analyticsDetail'>View analytics details</div>
                            <div style={{ marginLeft: 'auto', paddingRight: '0px', display: 'flex', alignItems: 'center' }}>
                                <Switch
                                    checked={isToggled}
                                    onChange={handleToggleChange}
                                    color="primary"
                                    style={{ color: '#ffe178', marginLeft: 'auto'}}
                                />
                            </div>

                        </div>
                        <div className='selectLineRight'>
                            <div className='llText' id='Temp'>Temperature </div>
                            <div className='tempNum' id='TempValue'>25°C</div>
                        </div>
                        <div className='selectLineRight'>
                            <div className='llText' id='Humid'>Humidity</div>
                            <div className='tempNum' id='HumidValue'>60%</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='predictRightContainer'>
                <div className='labelBox'>
                    <div className='labelBoxTitle'>CLOTHING STYLE PREDICTION</div>
                    <div className='line'></div>
                    <div className='labelText'>Upper Part</div>
                    <div className='rectangle'></div>
                    <div className='labelText'>Lower Part</div>
                    <div className='rectangle'></div>
                    <div className='labelBloxTitle' id='prediction'>PREDICTION</div>
                    <div className='labelText'>Comfort Level</div>
                </div>
            </div>
        </div>
    );
}

export default Prediction;
