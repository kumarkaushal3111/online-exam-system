const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const {
  createExam,
  addQuestion,
  addBulkQuestions,
  getAllExams,
  getQuestionsByExam,
  submitExam,
  getResults,
  getMyResults,
  deleteExam,
} = require("../controllers/examController");

// =====================
// ADMIN ROUTES
// =====================

router.post(
  "/create",
  verifyToken,
  isAdmin,
  createExam
);

router.post(
  "/add-question",
  verifyToken,
  isAdmin,
  addQuestion
);

router.post(
  "/add-bulk-questions",
  verifyToken,
  isAdmin,
  addBulkQuestions
);

router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  deleteExam
);

// =====================
// EXAM RESULTS ROUTES (ORDER MATTERS)
// =====================

// Global / Admin results route must come before the dynamic :userId parameter route
router.get(
  "/results/all",
  getResults
);

router.get(
  "/results/:userId",
  verifyToken,
  getMyResults
);

// =====================
// STUDENT / PUBLIC ROUTES
// =====================

router.post(
  "/submit",
  verifyToken,
  submitExam
);

router.get(
  "/",
  getAllExams
);

router.get(
  "/:examId/questions",
  getQuestionsByExam
);

module.exports = router;