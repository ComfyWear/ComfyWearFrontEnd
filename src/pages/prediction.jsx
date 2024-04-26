import React, { useState, useRef, useEffect } from 'react';
import '../assets/css/prediction.css';
import { Button, Switch } from '@mui/material';
import LoadingPopup from './LoadingPopup';
import FeedbackPopup from './FeedbackPopup';
import { v4 as uuidv4 } from 'uuid';
import mqtt from 'mqtt';
import { wait } from '@testing-library/user-event/dist/utils';


const Prediction = () => {
    const [uuid, setUuid] = useState(''); // This is the unique identifier for the image that is uploaded
    const [comfortLevel, setComfortLevel] = useState('');
    const [predictedComfort, setPredictedComfort] = useState([]);
    const [isToggled, setIsToggled] = useState(false);
    const [image, setImage] = useState(null);
    const fileInputRef = useRef(null);

    const [clothes, setClothes] = useState([]);
    const [temperature, setTemperature] = useState(25);
    const [humidity, setHumidity] = useState(60);
    const [client, setClient] = useState(null);
    const [mqttClient, setMqttClient] = useState(null);

    const [connected, setConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

    const [sensorDataReceived, setSensorDataReceived] = useState(false);

    useEffect(() => {
        if (!connected) {
            const options = {
                clientId: '',
                username: 'b6510545381',
                password: 'yanatchara.j@ku.th',
                reconnectPeriod: 0,
                port: 9001,
                clean: true,
            };

            const client = mqtt.connect('ws://iot.cpe.ku.ac.th:1883', options);

            client.on('connect', () => {
                console.log('Connected to MQTT broker');
                setConnected(true);
                setMqttClient(client);
                client.subscribe('b6510545381/callback_front', (err) => {
                    if (err) {
                        console.error('Error subscribing to topic:', err);
                    }
                });
            });

            client.on('message', (topic, message) => {
                console.log('Received message:', message.toString());
                // Parse the message JSON data
                const data = JSON.parse(message.toString());
                // Update the temperature and humidity state variables
                setTemperature(data.temp);
                setHumidity(data.humid);
                sendSensorData(client, uuid);
            });

            client.on('error', (err) => {
                console.error('MQTT error', err);
            });
        }

        // Disconnect from the MQTT broker when the component unmounts
        return () => {
            if (mqttClient) {
                mqttClient.unsubscribe('b6510545381/callback_front');
                mqttClient.end();
            }
        };
    }, [connected]);


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
                console.log('Image uploaded', image);
                const newUuid = uuidv4();
                setUuid(newUuid);
            };
            reader.readAsDataURL(file);
        }
        event.target.value = null;
    };

    useEffect(() => {
        if (image && uuid) {
            publishSensorData(mqttClient, uuid);
        }
    }, [image, uuid, mqttClient]);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const publishSensorData = (mqttClient, newUuid) => {
        mqttClient.publish('b6510545381/trigger_sensor', String(newUuid));
    };

    const sendSensorData = (mqttClient, newUuid) => {
        console.log('Sending sensor data');
        
        const formData = new FormData();
        formData.append('secret', newUuid);
        formData.append('local_temp', temperature);
        formData.append('local_humid', humidity);

        fetch('http://127.0.0.1:8000/app/api/sensor/', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Server returned an error');
                }
            })
            .then((data) => {
                console.log(data);
                setTemperature(data.data.attributes.local_temp);
                setHumidity(data.data.attributes.local_humid);
                setSensorDataReceived(false);
            })
            .catch((error) => {
                console.error('Error:', error);
            })
            .finally(() => {
                handleUpload(newUuid);
            });
    };

    const handleUpload = (newUuid) => {
        setIsLoading(true);

        const imageFormData = new FormData();
        imageFormData.append('secret', newUuid);
        imageFormData.append('image', dataURItoBlob(image), 'image.png');

        fetch('http://127.0.0.1:8000/app/api/predict/', {
            method: 'POST',
            body: imageFormData,
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Server returned an error');
                }
            })
            .then((data) => {
                console.log(data);
                setClothes(data.data.predictions);
                setPredictedComfort(data.data.comfort_level);

                if (data.data.images && data.data.images.length > 0) {
                    const detectedImageUrl = data.data.images[0].detected_image;
                    fetch(detectedImageUrl)
                        .then((response) => response.blob())
                        .then((blob) => {
                            const imageUrl = URL.createObjectURL(blob);
                            setImage(imageUrl);
                        })
                        .catch((error) => {
                            console.error('Error fetching detected image:', error);
                        });
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    const handleFeedbackPopupClose = () => {
        setShowFeedbackPopup(false);
    };

    const handleFeedback = () => {
        if (!image) {
            setShowFeedbackPopup(true);
            return;
        }

        const formData = new FormData();
        formData.append('secret', uuid);
        formData.append('comfort', comfortLevel);

        fetch('http://127.0.0.1:8000/app/api/comfort/', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Server returned an error');
                }
            })
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    return (
        <div className="predictBackground">
            {isLoading && <LoadingPopup />}
            {showFeedbackPopup && <FeedbackPopup onClose={handleFeedbackPopupClose} />}
            <div className="predictLeftContainer">
                {!isToggled ? (
                    <div className="imageBox">
                        <div className='imageContainer'>
                            {image ? (
                                <img src={image} alt="Uploaded" style={{ maxWidth: '745px', maxHeight: '383px', borderRadius: '10px' }} />
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
                    </div>) : (
                    <div className="imageBox">
                    </div>
                )}

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
                                onClick={handleFeedback}
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


                        </div>
                        <div className='selectLineRight'>
                            <div className='llText' id='Temp'>Temperature </div>
                            <div className='tempNum' id='TempValue'>{temperature}°C</div>
                        </div>
                        <div className='selectLineRight'>
                            <div className='llText' id='Humid'>Humidity</div>
                            <div className='tempNum' id='HumidValue'>{humidity}%</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='predictRightContainer'>
                <div className='labelBox'>
                    <div className='labelBoxTitle'>CLOTHING STYLE PREDICTION</div>
                    <div className='line'></div>
                    <div className='labelText'>Upper Part</div>
                    <div className='rectangle'>
                        {Object.entries(
                            clothes.reduce((acc, clothing) => {
                                if (clothing.predicted_upper !== null) {
                                    acc[clothing.predicted_upper] = (acc[clothing.predicted_upper] || 0) + 1;
                                }
                                return acc;
                            }, {})
                        ).map(([clothingName, count]) => (
                            <div key={clothingName} className='clothing'>
                                <div className='clothingName'>{`${clothingName} (${count})`}</div>
                            </div>
                        ))}
                    </div>

                    <div className='labelText'>Lower Part</div>
                    <div className='rectangle'>
                        {Object.entries(
                            clothes.reduce((acc, clothing) => {
                                if (clothing.predicted_lower !== null) {
                                    acc[clothing.predicted_lower] = (acc[clothing.predicted_lower] || 0) + 1;
                                }
                                return acc;
                            }, {})
                        ).map(([clothingName, count]) => (
                            <div key={clothingName} className='clothing'>
                                <div className='clothingName'>{`${clothingName} (${count})`}</div>
                            </div>
                        ))}
                    </div>
                    <div className='labelBoxDownTitle' id='prediction'>PREDICTION</div>
                    <div className='labelTextComfort'>
                        {Object.entries(
                            predictedComfort.reduce((acc, comfort) => {
                                if (comfort !== null) {
                                    acc[comfort] = (acc[comfort] || 0) + 1;
                                }
                                return acc;
                            }, {})
                        ).map(([comfortName, count]) => (
                            <div key={comfortName} className='comfort'>
                                <div className='comfortName'>{`Comfort Level ${comfortName} (${count})`}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Prediction;
