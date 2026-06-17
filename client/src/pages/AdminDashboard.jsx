import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  
  // Safely parse user session context from storage
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadExams();
  }, []);

  // Fetch all exams to display in management view
  const loadExams = async () => {
    try {
      const res = await API.get("/exams");
      setExams(res.data);
    } catch (error) {
      console.error("Error loading exams:", error);
    }
  };

  // Handler to delete a specific exam with token protection
  const deleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam? This will remove all associated questions.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/exams/${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state without forcing a full refresh
      setExams(exams.filter((exam) => exam.id !== examId));
      alert("Exam deleted successfully.");
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Failed to delete exam. Ensure server endpoint is ready.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      
      {/* Header Management Toolbar Area */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          borderBottom: "1px solid #ddd",
          paddingBottom: "15px"
        }}
      >
        <div>
          <h2>Admin Management Panel</h2>
          <p style={{ margin: 0, color: "#666" }}>Logged in as: <strong>{user?.name}</strong></p>
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
            fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </div>

      <h1>Admin Dashboard</h1>

      {/* Navigation Actions Grid */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
        <Link to="/create-exam">
          <button style={{ padding: "10px 20px", cursor: "pointer", fontWeight: "bold" }}>Create Exam</button>
        </Link>

        <Link to="/add-question">
          <button style={{ padding: "10px 20px", cursor: "pointer", fontWeight: "bold" }}>Add Question</button>
        </Link>

        {/* KEEP: Points to the global admin view results route */}
        <Link to="/results">
          <button style={{ padding: "10px 20px", cursor: "pointer", fontWeight: "bold" }}>View Results</button>
        </Link>
      </div>

      <hr />

      {/* Exam List and Management Table/Cards */}
      <h2>Manage Active Assessments</h2>
      {exams.length === 0 ? (
        <p>No exams found. Click "Create Exam" above to start adding assessments.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {exams.map((exam) => (
            <div
              key={exam.id}
              style={{
                border: "1px solid #ccc",
                padding: "20px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f9f9f9"
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>{exam.title}</h3>
                <p style={{ margin: "0 0 10px 0", color: "#555" }}>{exam.description}</p>
                <span style={{ marginRight: "15px", fontSize: "14px" }}>
                  ⏱ <strong>Duration:</strong> {exam.duration} mins
                </span>
                <span style={{ fontSize: "14px" }}>
                  ❓ <strong>Total Questions:</strong> {exam.total_questions}
                </span>
              </div>

              <button
                onClick={() => deleteExam(exam.id)}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;