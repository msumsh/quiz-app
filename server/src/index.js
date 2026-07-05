import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import {
  createRoom,
  getRoom,
  deleteRoom,
  addParticipant,
  removeParticipant,
  getParticipantsList,
  getCurrentQuestion,
  getLeaderboard,
  findRoomByHost,
  findRoomByParticipant,
} from "./rooms.js";

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("host:create_room", (quiz, callback) => {
    const room = createRoom({ hostSocketId: socket.id, quiz });
    socket.join(room.code);
    callback?.({ ok: true, roomCode: room.code });
  });

  socket.on("player:join_room", ({ roomCode, name }, callback) => {
    const room = getRoom(roomCode);

    if (!room) {
      callback?.({ ok: false, error: "Room not found" });
      return;
    }
    if (room.status !== "lobby") {
      callback?.({ ok: false, error: "This quiz has already started" });
      return;
    }

    addParticipant(room, socket.id, name);
    socket.join(room.code);

    callback?.({ ok: true });
    io.to(room.code).emit("room:participants_update", getParticipantsList(room));
  });

  socket.on("host:start_quiz", ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostSocketId !== socket.id) return;

    room.status = "active";
    room.currentQuestionIndex = -1;
    advanceToNextQuestion(room);
  });

  socket.on("player:submit_answer", ({ roomCode, optionIndex }) => {
    const room = getRoom(roomCode);
    if (!room || room.status !== "active") return;

    const participant = room.participants.get(socket.id);
    if (!participant || participant.hasAnsweredCurrent) return;

    participant.hasAnsweredCurrent = true;

    const question = getCurrentQuestion(room);
    if (question && optionIndex === question.correctOptionIndex) {
      participant.score += 10;
    }
  });

  socket.on("disconnect", () => {
    const hostedRoom = findRoomByHost(socket.id);
    if (hostedRoom) {
      io.to(hostedRoom.code).emit("room:host_disconnected");
      deleteRoom(hostedRoom.code);
      return;
    }

    const participantRoom = findRoomByParticipant(socket.id);
    if (participantRoom) {
      removeParticipant(participantRoom, socket.id);
      io.to(participantRoom.code).emit(
        "room:participants_update",
        getParticipantsList(participantRoom)
      );
    }
  });
});

function advanceToNextQuestion(room) {
  room.currentQuestionIndex += 1;
  const question = getCurrentQuestion(room);

  if (!question) {
    room.status = "finished";
    io.to(room.code).emit("quiz:finished", { leaderboard: getLeaderboard(room) });
    return;
  }

  for (const participant of room.participants.values()) {
    participant.hasAnsweredCurrent = false;
  }

  io.to(room.code).emit("question:show", {
    index: room.currentQuestionIndex,
    text: question.text,
    type: question.type,
    imageUrl: question.imageUrl ?? null,
    options: question.options,
    answerType: question.answerType,
    timeLimitSeconds: question.timeLimitSeconds,
  });

  room.questionTimer = setTimeout(() => {
    io.to(room.code).emit("question:results", {
      correctOptionIndex: question.correctOptionIndex,
      leaderboard: getLeaderboard(room),
    });
    advanceToNextQuestion(room);
  }, question.timeLimitSeconds * 1000);
}

httpServer.listen(PORT, () => {
  console.log(`Quiz server listening on http://localhost:${PORT}`);
});
