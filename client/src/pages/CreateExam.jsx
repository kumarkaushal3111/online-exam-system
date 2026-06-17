import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function CreateExam() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");

  const createExam = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.post(
        "/exams/create",
        {
          title,
          description,
          duration,
          total_questions: totalQuestions,
          created_by: 2,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const examId = res.data.exam.id;
      const count = res.data.exam.total_questions;

      navigate(`/add-question/${examId}/${count}`);

    } catch (err) {
      console.log(err);
      alert("Failed to create exam");
    }
  };

  return (
    <div>
      <h1>Create Exam</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Duration"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Number of Questions"
        value={totalQuestions}
        onChange={(e) => setTotalQuestions(e.target.value)}
      />

      <br /><br />

      <button onClick={createExam}>
        Create Exam
      </button>
    </div>
  );
}

export default CreateExam;