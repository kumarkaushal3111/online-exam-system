import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import API from "../services/api";
import "../assets/exam.css";

function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Refs for logic persistence
  const webcamRef = useRef(null);
  const answersRef = useRef([]); 
  const submittingRef = useRef(false); // ADDED: Guard to strictly block double submissions
  const cameraStreamRef = useRef(null); // ADDED: Tracks the active webcam hardware stream for termination

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [violations, setViolations] = useState(0);
  const [warningShown, setWarningShown] = useState(false);
  const MAX_VIOLATIONS = 2;
  const [timeLeft, setTimeLeft] = useState(1800);
  const [screenSharing, setScreenSharing] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Configuration States
  const [screenReady, setScreenReady] = useState(false);
  const [displayStream, setDisplayStream] = useState(null); 
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const loadQuestions = async () => {
    try {
      const res = await API.get(`/exams/${id}/questions`);
      setQuestions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const submitExam = async () => {
    // UPDATED: Double submission guard strategy using synchronous ref
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitted(true);

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await API.post(
        "/exams/submit",
        {
          user_id: user.id,
          exam_id: id,
          answers: answersRef.current,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`Score: ${res.data.score}/${res.data.total_marks}\nPercentage: ${res.data.percentage}%`);
      
      // UPDATED: Terminate Screen Sharing Stream
      if (displayStream) {
        displayStream.getTracks().forEach(track => track.stop());
      }

      // UPDATED: Terminate Hardware Webcam Stream
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // UPDATED: Safely exit full screen interface presentation mode
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      
      navigate("/student-dashboard");
    } catch (error) {
      console.error(error);
      // Reset ref flag if submission error occurs to let them retry
      submittingRef.current = false;
      setSubmitted(false);
    }
  };

  // Tab visibility and right-click handler
  useEffect(() => {
    loadQuestions();

    const handleVisibility = () => {
      if (!examStarted) return;

      if (document.hidden) {
        setWarningShown((prevWarning) => {
          if (!prevWarning) {
            alert("Warning: Tab Switching Detected. Next violation will terminate the exam.");
            return true;
          }
          return prevWarning;
        });
        setViolations((prev) => prev + 1);
      }
    };

    const disableRightClick = (e) => {
      e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, [examStarted]);

  // Fullscreen-exit detection listener hook
  useEffect(() => {
    const handleFullscreen = () => {
      if (examStarted && !document.fullscreenElement) {
        alert("Fullscreen exited. Exam terminated.");
        submitExam();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, [examStarted]);

  // Component Unmount Stream Track Cleaner
  useEffect(() => {
    return () => {
      if (displayStream) {
        displayStream.getTracks().forEach(track => track.stop());
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [displayStream]);

  // Step 1 - Enable Screen Share Function
  const enableScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      setDisplayStream(stream);
      setScreenReady(true);
      setScreenSharing(true);

      stream.getVideoTracks()[0].addEventListener("ended", () => {
        alert("Screen Sharing Stopped. Exam Terminated.");
        submitExam();
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Step 2 - Start Exam Function
  const startExam = async () => {
    console.log("START EXAM CLICKED");
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      // UPDATED: Securely retain reference context of hardware stream for dynamic unmount stopping 
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      cameraStreamRef.current = cameraStream;

      setExamStarted(true);

    } catch (err) {
      console.error(err);
      alert("Please allow camera and fullscreen.");
    }
  };

  useEffect(() => {
    if (!examStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted]);

  useEffect(() => {
    if (violations >= MAX_VIOLATIONS) {
      alert("Exam Terminated Due To Multiple Violations");
      submitExam();
    }
  }, [violations]);

  const selectAnswer = (questionId, answer) => {
    const existing = answers.find((a) => a.question_id === questionId);

    if (existing) {
      setAnswers(
        answers.map((a) =>
          a.question_id === questionId
            ? { ...a, selected_answer: answer }
            : a
        )
      );
    } else {
      setAnswers([
        ...answers,
        { question_id: questionId, selected_answer: answer },
      ]);
    }
  };

  if (!examStarted) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "20px",
          background: "#111",
          color: "#fff"
        }}
      >
        <h1>Online Proctored Exam</h1>
        <p>Camera, Screen Sharing and Fullscreen are required</p>
        
        {!screenReady ? (
          <button
            onClick={enableScreenShare}
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              cursor: "pointer",
              borderRadius: "5px",
              border: "none",
              background: "#ff9f43",
              color: "#fff",
              fontWeight: "bold"
            }}
          >
            Share Screen
          </button>
        ) : (
          <button
            onClick={startExam}
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              cursor: "pointer",
              borderRadius: "5px",
              border: "none",
              background: "#00adb5",
              color: "#fff",
              fontWeight: "bold"
            }}
          >
            Start Exam
          </button>
        )}
      </div>
    );
  }

  // Logic variables for structural execution returns
  const currentQ = questions[currentQuestion];

  const isAnswered = (questionId) =>
    answers.some((a) => a.question_id === questionId);

  return (
    <div className="exam-container">

      <div className="exam-header">
        <h2>Online Assessment</h2>

        <div className="timer">
          ⏱ {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </div>
      </div>

      <div className="exam-body">

        {/* LEFT SIDEBAR */}
        <div className="sidebar">

          <h3>Questions</h3>

          <div className="question-grid">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(index)}
                className={
                  isAnswered(q.id)
                    ? "question-btn answered"
                    : "question-btn"
                }
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="stats">
            <p>Answered: {answers.length}</p>
            <p>Remaining: {questions.length - answers.length}</p>
          </div>

        </div>

        {/* CENTER QUESTION */}
        <div className="question-panel">

          {currentQ && (
            <>
              <h2>
                Question {currentQuestion + 1} / {questions.length}
              </h2>

              <p className="question-text">
                {currentQ.question}
              </p>

              {["A", "B", "C", "D"].map((option) => (
                <label
                  key={option}
                  className="option-card"
                >
                  <input
                    type="radio"
                    name={`q${currentQ.id}`}
                    checked={
                      answers.find(
                        (a) => a.question_id === currentQ.id
                      )?.selected_answer === option
                    }
                    onChange={() =>
                      selectAnswer(currentQ.id, option)
                    }
                  />
                  {currentQ[`option_${option.toLowerCase()}`]}
                </label>
              ))}

              <div className="navigation">

                <button
                  disabled={currentQuestion === 0}
                  onClick={() =>
                    setCurrentQuestion(currentQuestion - 1)
                  }
                >
                  Previous
                </button>

                <button
                  disabled={currentQuestion === questions.length - 1}
                  onClick={() =>
                    setCurrentQuestion(currentQuestion + 1)
                  }
                >
                  Next
                </button>

                <button
                  className="submit-btn"
                  onClick={submitExam}
                  disabled={submitted}
                >
                  {submitted ? "Submitting..." : "Submit Exam"}
                </button>

              </div>
            </>
          )}

        </div>

        {/* RIGHT PANEL */}
        <div className="proctor-panel">

          <Webcam
            ref={webcamRef}
            audio={false}
            width="100%"
          />

          <div className="status">
            {screenSharing
              ? "🟢 Proctoring Active"
              : "🔴 Screen Sharing Off"}
          </div>

          <div className="info-box">
            Violations: {violations}
          </div>

          <div className="info-box">
            Time Left:
            <br />
            {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </div>

        </div>

      </div>

    </div>
  );
}

export default TakeExam;