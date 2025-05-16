import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Link } from "react-router-dom";
import "./Upload.css";

const Upload = () => {
  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState("");

  // ✅ Load dataset from localStorage when page loads
  useEffect(() => {
    const storedData = localStorage.getItem("dataset");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setTableData(parsedData);
      if (parsedData.length > 0) {
        setHeaders(Object.keys(parsedData[0]));
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file || file.type !== "text/csv") {
      alert("Please select a valid CSV file.");
      return;
    }

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const data = results.data;
        if (data.length > 0) {
          setHeaders(Object.keys(data[0]));
          setTableData(data);
          localStorage.setItem("dataset", JSON.stringify(data));
        } else {
          alert("CSV is empty or improperly formatted.");
        }
      },
    });
  };

  return (
    <div className="upload-container">
      {/* ✅ Navbar added */}
      <nav className="navbar">
        <div className="logo">
          Stress <span className="orange-text">Level Detection</span>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/upload">Upload</Link></li>
          <li><Link to="/admin">Admin Login</Link></li> 
        </ul>
      </nav>

      <h2 style={{ marginTop: "60px"  }}>Dataset</h2>

      <input type="file" accept=".csv" onChange={handleFileChange} />
      {fileName && <p>Selected File: {fileName}</p>}

      {tableData.length > 0 && (
        <div className="table-container">
          <h3>Preview of Uploaded Dataset</h3>
          <table>
            <thead>
              <tr>
                {headers.map((header, idx) => (
                  <th key={idx}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Upload;
