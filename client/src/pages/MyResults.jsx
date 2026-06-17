import { useEffect, useState } from "react";
import API from "../services/api";

function MyResults() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await API.get(
        `/exams/results/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>My Results</h1>

      {results.map((result) => (
        <div key={result.id}>
          <h3>{result.title}</h3>
          <p>Score: {result.score}</p>
          <p>Total Marks: {result.total_marks}</p>
        </div>
      ))}
    </div>
  );
}

export default MyResults;