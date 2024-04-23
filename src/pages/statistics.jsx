import React, { useState, useEffect } from 'react';
import '../assets/css/statistic.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import tempIcon from '../assets/images/photography.png';
import humidIcon from '../assets/images/humidity.png';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import confusionMatrix from '../assets/images/model_sum/confusion_matrix.png';
import f1Curve from '../assets/images/model_sum/F1_curve.png';
import labelsCorrelogram from '../assets/images/model_sum/labels_correlogram.jpg';
import labels from '../assets/images/model_sum/labels.jpg';
import pCurve from '../assets/images/model_sum/P_curve.png';
import prCurve from '../assets/images/model_sum/PR_curve.png';



const Statistics = () => {
    const [data, setData] = useState(null);
    const [selectedComfort, setSelectedComfort] = useState('1');
    const [showCharts, setShowCharts] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/app/api/integrate/');
                if (response.ok) {
                    const jsonData = await response.json();
                    console.log('Data fetched:', jsonData);
                    setData(jsonData.data);
                } else {
                    throw new Error('Request failed');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    if (!data) {
        return <div>Loading...</div>;
    }

    const { avg_comfort_level, comfort_level_distribution, comfort_level_details, label_counts } = data;

    // Prepare data for the comfort level distribution bar chart
    const comfortLevelData = [
        { comfort: '1', count: 0 },
        { comfort: '2', count: 0 },
        { comfort: '3', count: 0 },
        { comfort: '4', count: 0 },
        { comfort: '5', count: 0 },
    ];

    comfort_level_distribution.forEach(item => {
        const index = parseInt(item.comfort) - 1;
        comfortLevelData[index].count += item.count;
    });

    // Prepare data for the label counts pie chart
    const labelCountsData = Object.entries(label_counts).map(([label, count]) => ({
        name: label,
        value: count,
    }));

    const scatterData = Object.entries(comfort_level_details).map(([comfort, details]) => ({
        comfort: parseInt(comfort),
        avgTemp: details.avg_temp,
        avgHumid: details.avg_humid,
    }));

    // Custom colors for the pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div>
            <div className="statisticsBackground">
                <div className="statisticsContainerLeft">
                    <div className="headingContainer">
                        <h1>STATISTICS</h1>
                        <div className="switchContainer">
                            <span className="switchLabel" onClick={() => setShowCharts(!showCharts)}>
                                View Model Summary Data
                            </span>
                        </div>
                    </div>
                    <div className='leftBox'>
                        {/* average comfort with two digits decimals */}

                        {!showCharts ? (
                            <div>
                                <h2>Average Comfort Level: {avg_comfort_level.toFixed(2)}</h2>
                                <div className='comfortChart'>
                                    <Carousel>

                                        <div className='disChart'>
                                            <h3>Comfort Level Distribution</h3>
                                            <BarChart width={400} height={300} data={comfortLevelData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="white" />
                                                <XAxis dataKey="comfort" tick={{ fill: 'white' }} />
                                                <YAxis tick={{ fill: 'white' }} />
                                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }} />
                                                <Legend wrapperStyle={{ color: 'white' }} />
                                                <Bar dataKey="count" fill="#FFBB28" />
                                            </BarChart>
                                        </div>

                                        <div className='disChart'>
                                            <h3>Label Counts</h3>
                                            <PieChart width={400} height={300}>
                                                <Pie
                                                    data={labelCountsData}
                                                    cx={200}
                                                    cy={100}
                                                    labelLine={false}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {labelCountsData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </div>

                                        <div className='disChart'>
                                            <h3>Temperature vs Humidity (Comfort Level)</h3>
                                            <ScatterChart width={400} height={300}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="white" />
                                                <XAxis type="number" dataKey="avgTemp" name="Average Temperature" unit="°C" tick={{ fill: 'white' }} />
                                                <YAxis type="number" dataKey="avgHumid" name="Average Humidity" unit="%" tick={{ fill: 'white' }} />
                                                <Tooltip
                                                    cursor={{ strokeDasharray: '3 3' }}
                                                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }}
                                                    formatter={(value, name, props) => {
                                                        if (name === 'Data Points') {
                                                            const { avgTemp, avgHumid, comfort } = props.payload;
                                                            return [
                                                                `Temperature: ${avgTemp}°C`,
                                                                `Humidity: ${avgHumid}%`,
                                                                `Comfort Level: ${comfort}`,
                                                            ];
                                                        }
                                                        return value;
                                                    }}
                                                />
                                                <Legend wrapperStyle={{ color: 'white' }} />
                                                <Scatter
                                                    name="Data Points"
                                                    data={scatterData}
                                                    fill="#FF8042"
                                                    color={(entry) => {
                                                        // Assign different colors based on comfort level
                                                        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
                                                        return colors[entry.comfort - 1];
                                                    }}
                                                />
                                            </ScatterChart>
                                        </div>
                                    </Carousel>
                                </div>
                            </div>
                        ) : (
                            <div className='imageContainer'>
                                <Carousel>
                                    <div>
                                        <img src={confusionMatrix} alt="Confusion Matrix" />
                                    </div>
                                    <div>
                                        <img src={f1Curve} alt="F1 Curve" />
                                    </div>
                                    <div>
                                        <img src={labelsCorrelogram} alt="Labels Correlogram" />
                                    </div>
                                    <div>
                                        <img src={labels} alt="Labels" />
                                    </div>
                                    <div>
                                        <img src={pCurve} alt="P Curve" />
                                    </div>
                                    <div>
                                        <img src={prCurve} alt="PR Curve" />
                                    </div>
                                </Carousel>
                            </div>
                        )}
                    </div>
                </div>

                <div className="statisticsContainerRight">
                    <div className='rightBox'>
                        <h3 style={{ marginBottom: '0px' }}>Comfort Level Details</h3>
                        <select
                            value={selectedComfort}
                            onChange={(e) => setSelectedComfort(e.target.value)}
                            className="comfortLevelSelect"
                        >
                            {Object.keys(comfort_level_details).map((comfort) => (
                                <option key={comfort} value={comfort}>
                                    {comfort}
                                </option>
                            ))}
                        </select>
                        {selectedComfort && (
                            <div className='comfortDetails'>
                                <div className='detailBox'>
                                    <div className="comfortLevelContainer">
                                        <h4>Comfort Level <span className="comfortLevelCircle">{selectedComfort}</span></h4>
                                        <p className="comfortLevelCount">Count: {comfort_level_details[selectedComfort].count}</p>
                                    </div>
                                    <div className='tempHumidContainer'>
                                        <img src={tempIcon} alt="Temperature" className='tempHumidIcon' />
                                        <p>Average Temperature: {comfort_level_details[selectedComfort].avg_temp}</p>
                                    </div>
                                    <div className='tempHumidContainer'>
                                        <img src={humidIcon} alt="Humidity" className='tempHumidIcon' />
                                        <p>Average Humidity: {comfort_level_details[selectedComfort].avg_humid}</p>
                                    </div>
                                    <div className='uplowPart'>
                                        <h5>Upper Labels</h5>
                                        <ul>
                                            {Object.entries(comfort_level_details[selectedComfort].upper_labels).map(([label, count]) => (
                                                <li key={label}>
                                                    {label}: {count}
                                                </li>
                                            ))}
                                        </ul>
                                        <h5>Lower Labels</h5>
                                        <ul>
                                            {Object.entries(comfort_level_details[selectedComfort].lower_labels).map(([label, count]) => (
                                                <li key={label}>
                                                    {label}: {count}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Statistics;