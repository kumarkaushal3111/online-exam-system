import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function StudentDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  // Safely parse user session context from state storage
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const res = await API.get("/exams");
      setExams(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      
      {/* Dynamic Header Area with user details and application sign-out function */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2>Welcome, {user?.name}</h2>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <h1>Student Dashboard</h1>

      {/* UPDATED: Navigates cleanly to /my-results on click */}
      <button 
        onClick={() => navigate("/my-results")} 
        style={{ padding: "10px 15px", cursor: "pointer" }}
      >
        My Results
      </button>

      <br />
      <br />

      <h2>Available Exams</h2>

      {exams.map((exam) => (
        <div
          key={exam.id}
          style={{
            border: "1px solid gray",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px"
          }}
        >
          <h3>{exam.title}</h3>

          <p>{exam.description}</p>

          <p>
            <strong>Duration:</strong> {exam.duration} Minutes
          </p>

          <p>
            <strong>Questions:</strong> {exam.total_questions}
          </p>

          <Link to={`/take-exam/${exam.id}`}>
            <button style={{ padding: "8px 16px", cursor: "pointer" }}>
              Start Exam
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default StudentDashboard;