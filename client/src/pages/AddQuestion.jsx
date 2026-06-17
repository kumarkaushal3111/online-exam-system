import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function AddQuestion() {
  const { examId, count } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(
    Array.from(
      { length: Number(count) },
      () => ({
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "",
        marks: 1,
      })
    )
  );

  const handleChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const saveQuestions = async () => {
    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/exams/add-bulk-questions",
        {
          exam_id: examId,
          questions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("All Questions Added Successfully");
      navigate("/admin-dashboard");

    } catch (error) {
      console.log(error);
      alert("Failed to save questions");
    }
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "auto",
        padding: "20px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        Add {count} Questions
      </h1>

      {questions.map((q, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #444",
            borderRadius: "12px",
            padding: "25px",
            marginBottom: "25px",
            backgroundColor: "#1a1a1a",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Question {index + 1}
          </h2>

          <textarea
            rows="3"
            placeholder="Enter Question"
            value={q.question}
            onChange={(e) =>
              handleChange(
                index,
                "question",
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              marginBottom: "15px",
            }}
          />

          <input
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
            }}
            placeholder="Option A"
            value={q.option_a}
            onChange={(e) =>
              handleChange(
                index,
                "option_a",
                e.target.value
              )
            }
          />

          <input
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
            }}
            placeholder="Option B"
            value={q.option_b}
            onChange={(e) =>
              handleChange(
                index,
                "option_b",
                e.target.value
              )
            }
          />

          <input
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
            }}
            placeholder="Option C"
            value={q.option_c}
            onChange={(e) =>
              handleChange(
                index,
                "option_c",
                e.target.value
              )
            }
          />

          <input
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
            }}
            placeholder="Option D"
            value={q.option_d}
            onChange={(e) =>
              handleChange(
                index,
                "option_d",
                e.target.value
              )
            }
          />

          <select
            value={q.correct_answer}
            onChange={(e) =>
              handleChange(
                index,
                "correct_answer",
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "10px",
            }}
          >
            <option value="">
              Select Correct Answer
            </option>
            <option value="A">Option A</option>
            <option value="B">Option B</option>
            <option value="C">Option C</option>
            <option value="D">Option D</option>
          </select>
        </div>
      ))}

      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
        }}
      >
        <button
          onClick={saveQuestions}
          style={{
            padding: "12px 30px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Save All Questions
        </button>
      </div>
    </div>
  );
}

export default AddQuestion;