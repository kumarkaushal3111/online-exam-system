const pool = require("../config/db");

// Create Exam
const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      created_by,
      total_questions,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO exams
      (
        title,
        description,
        duration,
        created_by,
        total_questions
      )
      VALUES($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        title,
        description,
        duration,
        created_by,
        total_questions,
      ]
    );

    res.status(201).json({
      message: "Exam created successfully",
      exam: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add Question
const addQuestion = async (req, res) => {
  try {
    const {
      exam_id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      marks,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO questions
      (
        exam_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        marks
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        exam_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        marks || 1,
      ]
    );

    res.status(201).json({
      message: "Question added successfully",
      question: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Exams
const getAllExams = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM exams ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Questions By Exam
const getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const result = await pool.query(
      "SELECT * FROM questions WHERE exam_id = $1",
      [examId]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Submit Exam
const submitExam = async (req, res) => {
  try {
    const { user_id, exam_id, answers } = req.body;

    let score = 0;
    let total_marks = 0;

    const attemptResult = await pool.query(
      `INSERT INTO exam_attempts
      (user_id, exam_id)
      VALUES($1,$2)
      RETURNING *`,
      [user_id, exam_id]
    );

    const attemptId = attemptResult.rows[0].id;

    for (const answer of answers) {
      const questionResult = await pool.query(
        "SELECT * FROM questions WHERE id = $1",
        [answer.question_id]
      );

      const question = questionResult.rows[0];
      total_marks += question.marks;

      const isCorrect = answer.selected_answer === question.correct_answer;

      if (isCorrect) {
        score += question.marks;
      }

      await pool.query(
        `INSERT INTO student_answers
        (attempt_id, question_id, selected_answer, is_correct)
        VALUES($1,$2,$3,$4)`,
        [
          attemptId,
          answer.question_id,
          answer.selected_answer,
          isCorrect,
        ]
      );
    }

    await pool.query(
      `UPDATE exam_attempts
       SET score=$1,total_marks=$2
       WHERE id=$3`,
      [score, total_marks, attemptId]
    );

    res.json({
      message: "Exam submitted successfully",
      score,
      total_marks,
      percentage: ((score / total_marks) * 100).toFixed(2),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Results (Admin / Global view)
const getResults = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ea.id,
        u.name,
        e.title,
        ea.score,
        ea.total_marks,
        ea.submitted_at
      FROM exam_attempts ea
      JOIN users u ON ea.user_id = u.id
      JOIN exams e ON ea.exam_id = e.id
      ORDER BY ea.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Specific Student Results By User ID
const getMyResults = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT
        ea.id,
        e.title,
        ea.score,
        ea.total_marks,
        ea.submitted_at
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      WHERE ea.user_id = $1
      ORDER BY ea.id DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add Bulk Questions
const addBulkQuestions = async (req, res) => {
  try {
    const { exam_id, questions } = req.body;

    for (const q of questions) {
      await pool.query(
        `INSERT INTO questions
        (
          exam_id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          marks
        )
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          exam_id,
          q.question,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_answer,
          q.marks || 1,
        ]
      );
    }

    res.json({ message: "Questions added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ADDED: Delete Exam and its associated questions
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete child dependencies (questions) first to avoid foreign key errors
    await pool.query(
      "DELETE FROM questions WHERE exam_id = $1", 
      [id]
    );

    // Now safe to drop the target exam entry
    await pool.query(
      "DELETE FROM exams WHERE id = $1", 
      [id]
    );

    res.json({
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Export all controller references
module.exports = {
  createExam,
  addQuestion,
  addBulkQuestions,
  getAllExams,
  getQuestionsByExam,
  submitExam,
  getResults,
  getMyResults,
  deleteExam, // UPDATED: Included handler reference here
};