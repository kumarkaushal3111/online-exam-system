import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateExam from "./pages/CreateExam";
import TakeExam from "./pages/TakeExam";
import Results from "./pages/Results";
import MyResults from "./pages/MyResults"; // ADDED: Specific student results page import
import AddQuestion from "./pages/AddQuestion";

function App() {
  return (
    <Routes>
      {/* Both index root and explicit path handle user authorization entry points */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="/student-dashboard"
        element={<StudentDashboard />}
      />

      <Route
        path="/create-exam"
        element={<CreateExam />}
      />

      <Route
        path="/take-exam/:id"
        element={<TakeExam />}
      />

      {/* Global / Admin View Results Route */}
      <Route
        path="/results"
        element={<Results />}
      />

      {/* ADDED: Individual Student Dashboard View Results Route */}
      <Route
        path="/my-results"
        element={<MyResults />}
      />

      {/* Dynamic Add Question Route */}
      <Route
        path="/add-question/:examId/:count"
        element={<AddQuestion />}
      />
    </Routes>
  );
}

export default App;