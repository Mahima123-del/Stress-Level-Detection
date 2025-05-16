import React, { createContext, useState } from 'react';

// Create a new context
export const ResultContext = createContext();

export const ResultProvider = ({ children }) => {
  const [resultList, setResultList] = useState([]); // Store results in an array

  const addResult = (newResult) => {
    setResultList((prevResults) => [...prevResults, newResult]); // Add new result to the array
  };

  return (
    <ResultContext.Provider value={{ resultList, addResult }}>
      {children}
    </ResultContext.Provider>
  );
};
