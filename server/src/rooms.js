const rooms = new Map();

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

function generateRoomCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () =>
      ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
    ).join("");
  } while (rooms.has(code));

  return code;
}

export function createRoom({ hostSocketId, quiz }) {
  const code = generateRoomCode();

  const room = {
    code,
    hostSocketId,
    quiz,
    participants: new Map(),
    status: "lobby",
    currentQuestionIndex: -1,
    questionTimer: null,
  };

  rooms.set(code, room);
  return room;
}

export function getRoom(code) {
  return rooms.get(code);
}

export function deleteRoom(code) {
  const room = rooms.get(code);
  if (room?.questionTimer) clearTimeout(room.questionTimer);
  rooms.delete(code);
}

export function addParticipant(room, socketId, name) {
  room.participants.set(socketId, {
    id: socketId,
    name,
    score: 0,
    hasAnsweredCurrent: false,
  });
}

export function removeParticipant(room, socketId) {
  room.participants.delete(socketId);
}

export function getParticipantsList(room) {
  return Array.from(room.participants.values()).map(
    ({ id, name, score }) => ({ id, name, score })
  );
}

export function getCurrentQuestion(room) {
  return room.quiz.questions[room.currentQuestionIndex] ?? null;
}

export function getLeaderboard(room) {
  return getParticipantsList(room).sort((a, b) => b.score - a.score);
}

export function findRoomByHost(hostSocketId) {
  for (const room of rooms.values()) {
    if (room.hostSocketId === hostSocketId) return room;
  }
  return undefined;
}

export function findRoomByParticipant(socketId) {
  for (const room of rooms.values()) {
    if (room.participants.has(socketId)) return room;
  }
  return undefined;
}
