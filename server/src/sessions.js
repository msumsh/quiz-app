import { query } from "./db.js";

export async function createSession({ quizId, roomCode, hostId, participants }) {
  await query(
    `INSERT INTO quiz_sessions (quiz_id, room_code, host_id, participants)
     VALUES ($1, $2, $3, $4)`,
    [quizId, roomCode, hostId, JSON.stringify(participants)]
  );
}

export async function findHistoryForUser(userId) {
  const result = await query(
    `SELECT
       qs.id,
       qs.room_code,
       qs.participants,
       qs.finished_at,
       qs.host_id,
       q.title,
       q.category
     FROM quiz_sessions qs
     JOIN quizzes q ON q.id = qs.quiz_id
     WHERE qs.host_id = $1 OR qs.participants @> $2::jsonb
     ORDER BY qs.finished_at DESC`,
    [userId, JSON.stringify([{ userId }])]
  );

  return result.rows.map((row) => {
    const wasHost = row.host_id === userId;
    const myEntry = row.participants.find((p) => p.userId === userId);

    return {
      sessionId: row.id,
      title: row.title,
      category: row.category,
      roomCode: row.room_code,
      finishedAt: row.finished_at,
      role: wasHost ? "organizer" : "participant",
      score: myEntry ? myEntry.score : null,
      participantCount: row.participants.length,
    };
  });
}
