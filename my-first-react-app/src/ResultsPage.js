import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ResultsPage.css"; // Import the CSS file here
import moment from "moment";  // For formatting date and time
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components of Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Stress Level Over Time",
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
    ],
  });

  useEffect(() => {
  const fetchResults = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const response = await axios.get(`http://localhost:5000/api/get-stress-results?userId=${userId}`);
      setResults(response.data);

      // Prepare chart data for all metrics
      const labels = response.data.map(result => moment(result.timestamp).format("YYYY-MM-DD HH:mm:ss"));
      
      const sentimentNeg = response.data.map(result => Number(result.sentiment_neg));
      const classifierConfidence = response.data.map(result => Number(result.classifier_confidence));
      const totalScore = response.data.map(result => Number(result.total_score));

      setChartData({
        labels,
        datasets: [
          {
            label: "Sentiment Negative",
            data: sentimentNeg,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: false,
          },
          {
            label: "Classifier Confidence",
            data: classifierConfidence,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: false,
          },
          {
            label: "Total Score",
            data: totalScore,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  fetchResults();
}, []);


  return (
    <div className="results-container">
      <h2 className="results-heading">Your Stress Analysis Results</h2>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <>
          
          
          {/* Table */}
          <table className="results-table">
            <thead>
              <tr>
                <th>Input Text</th>
                <th>Stress Level</th>
                <th>Sentiment Negative</th>
                <th>Keywords</th>
                <th>Confidence</th>
                <th>Total Score</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>{result.input_text}</td>
                  <td>{result.stress_level}</td>
                  <td>{result.sentiment_neg}</td>
                  <td>{result.keywords}</td>
                  <td>{result.classifier_confidence}</td>
                  <td>{result.total_score}</td>
                  <td>{moment(result.timestamp).format("YYYY-MM-DD HH:mm:ss")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Line Graph */}
          <div className="graph-container">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>



        </>
      )}
    </div>
  );
};

export default ResultsPage;
