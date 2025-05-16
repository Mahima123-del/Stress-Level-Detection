import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const GraphPage = () => {
  const { email } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/results`) // Replace with specific API if possible
      .then(res => res.json())
      .then(data => {
        const user = data.find(item => item.email === email);
        setUserData(user);
      })
      .catch(err => console.error('Error fetching user:', err));
  }, [email]);

  const getStressLevelValue = (level) => {
    switch (level?.toLowerCase()) {
      case 'not stressed': return 20;
      case 'moderate stress': return 50;
      case 'highly stressed': return 90;
      default: return 0;
    }
  };

  if (!userData) return <p>Loading graph...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Stress Level Graph for {userData.name}</h2>
      <Bar
        data={{
          labels: ['Stress Level'],
          datasets: [{
            label: 'Level',
            data: [getStressLevelValue(userData.predicted_stress)],
            backgroundColor: '#e67e22',
          }],
        }}
        options={{
          responsive: true,
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: { stepSize: 20 }
            },
            x: { display: false }
          }
        }}
      />
      <br />
      <Link to="/results">← Back to Results</Link>
    </div>
  );
};

export default GraphPage;
