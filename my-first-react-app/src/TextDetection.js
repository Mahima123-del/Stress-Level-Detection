import React, { useState, useContext } from "react";
import axios from "axios";
import { ResultContext } from "./ResultContext"; // Import ResultContext
import "./TextDetection.css";

const TextDetection = () => {
  const [text, setText] = useState(""); // Holds the user input text
  const [result, setResult] = useState(null); // Holds the response from the API
  const { addResult } = useContext(ResultContext); // Get addResult function from ResultContext
  
  const handleTextChange = (e) => {
    setText(e.target.value); // Update text input value
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post("http://localhost:5001/api/detect_stress", {
      text,
    });

    setResult(response.data);

    const sentimentNeg = response.data.sentiment_neg.replace(/[^\x20-\x7E]/g, "");
    const inputText = text;

    // Clean classifier_confidence and total_score to ensure only numeric values are kept
    const rawConfidence = response.data.classifier_confidence;
    const rawScore = response.data.total_score;

    const classifierConfidence = parseFloat(String(rawConfidence).replace(/[^\d.-]/g, ""));
    const totalScore = parseFloat(String(rawScore).replace(/[^\d.-]/g, ""));

    // Fallback if parse fails
    if (isNaN(classifierConfidence) || isNaN(totalScore)) {
      console.error("Invalid numeric values:", { classifierConfidence, totalScore });
      return;
    }

    await axios.post("http://localhost:5000/api/save-stress", {
      userId: localStorage.getItem("userId"),
      stress_level: response.data.level,
      sentiment_neg: sentimentNeg,
      keywords: response.data.keywords,
      classifier_confidence: classifierConfidence,
      total_score: totalScore,
      input_text: inputText,
    });

    addResult({
      text,
      level: response.data.level,
      keywords: response.data.keywords,
      sentiment_neg: sentimentNeg,
      classifier_confidence: classifierConfidence,
      total_score: totalScore,
      input_text: inputText
    });

  } catch (error) {
    console.error("Error calling API:", error);
  }
};



  return (
    <div className="page">
      <div className="side-panel left">
        <img src="/images/photo3.webp" alt="Relax" className="side-image" />
        <div>
          <h2>🧘‍♀️ Relax</h2>
          <p>Take a deep breath and express freely.</p>
        </div>
      </div>

      <div className="center-box">
        <h1>Text Detection</h1>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Type your thoughts here..."
        />
        <br />
        <button onClick={handleSubmit}>Analyze</button>

        {result && (
          <div className="result">
            <h3>Result</h3>
            <p><strong>Stress Level:</strong> {result.level}</p>
            <p><strong>Keywords:</strong> {result.keywords}</p>
            <p><strong>Negative Sentiment:</strong> {result.sentiment_neg}</p>
            <p><strong>Confidence:</strong> {result.classifier_confidence}</p>
            <p><strong>Total Score:</strong> {result.total_score}</p>
          </div>
        )}
      </div>

      <div className="side-panel right">
        <img src="/images/photo4.jpg" alt="Breathe" className="side-image" />
        <div>
          <h2>🌿 Breathe</h2>
          <p>You're not alone. This tool is here to help you.</p>
        </div>
      </div>
    </div>
  );
};

export default TextDetection;
