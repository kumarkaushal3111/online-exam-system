import { useEffect, useState } from "react";
import API from "../services/api";

function Results() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const res = await API.get("/exams/results/all");
      console.log("Admin Results:", res.data);
      setResults(res.data);
    } catch (error) {
      console.error("Error loading results:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1 style={{ textAlign: "center" }}>All Exam Results</h1>

      <table
        style={{
          width: "100%",
          marginTop: "30px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #334155", textAlign: "left" }}>
            <th style={{ padding: "12px" }}>Student</th>
            <th style={{ padding: "12px" }}>Exam</th>
            <th style={{ padding: "12px" }}>Score</th>
            <th style={{ padding: "12px" }}>Total Marks</th>
            <th style={{ padding: "12px" }}>Percentage</th>
            <th style={{ padding: "12px" }}>Date</th>
          </tr>
        </thead>

        <tbody>
          {results.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                No results found
              </td>
            </tr>
          ) : (
            results.map((result) => (
              <tr
                key={result.id}
                style={{
                  borderBottom: "1px solid #1e293b",
                }}
              >
                <td style={{ padding: "12px" }}>{result.name}</td>
                <td style={{ padding: "12px" }}>{result.title}</td>
                <td style={{ padding: "12px" }}>{result.score}</td>
                <td style={{ padding: "12px" }}>{result.total_marks}</td>
                <td style={{ padding: "12px" }}>
                  {result.total_marks > 0
                    ? ((result.score / result.total_marks) * 100).toFixed(2)
                    : "0.00"}%
                </td>
                <td style={{ padding: "12px" }}>
                  {new Date(result.submitted_at).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Results;