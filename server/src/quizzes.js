import { query } from "./db.js";

export async function createQuiz({ title, category, questions, createdBy }) {
  const result = await query(
    `INSERT INTO quizzes (title, category, questions, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, category, questions, created_by, created_at`,
    [title, category, JSON.stringify(questions), createdBy]
  );
  return toPublicQuiz(result.rows[0]);
}

export async function findQuizzesByUser(userId) {
  const result = await query(
    `SELECT id, title, category, questions, created_by, created_at
     FROM quizzes
     WHERE created_by = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows.map(toPublicQuiz);
}

export async function findQuizById(id) {
  const result = await query(
    `SELECT id, title, category, questions, created_by, created_at
     FROM quizzes WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? toPublicQuiz(result.rows[0]) : null;
}

function toPublicQuiz(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    questions: row.questions,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}