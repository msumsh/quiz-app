import "dotenv/config";

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import { initDb } from "./db.js";
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
import { createUser, verifyCredentials, findUserById } from "./users.js";
import { createQuiz, findQuizzesByUser } from "./quizzes.js";
import { createSession, findHistoryForUser } from "./sessions.js";
import { signToken, requireAuth, verifyToken } from "./auth.js";
import {
  validateRegisterInput,
  validateLoginInput,
  validateQuizPayload,
  validateJoinPayload,
} from "./validators.js";

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const { error, value } = validateRegisterInput(req.body || {});
    if (error) {
      res.status(400).json({ error });
      return;
    }

    try {
      const user = await createUser(value);
      const token = signToken(user);
      res.status(201).json({ token, user });
    } catch (err) {
      if (err.message.includes("already exists")) {
        res.status(409).json({ error: err.message });
        return;
      }
      throw err;
    }
  })
);

app.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const { error, value } = validateLoginInput(req.body || {});
    if (error) {
      res.status(400).json({ error });
      return;
    }

    const user = await verifyCredentials(value.email, value.password);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken(user);
    res.json({ token, user });
  })
);

app.get(
  "/auth/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user });
  })
);

app.get(
  "/quizzes/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const quizzes = await findQuizzesByUser(req.userId);
    res.json({ quizzes });
  })
);

app.get(
  "/history",
  requireAuth,
  asyncHandler(async (req, res) => {
    const history = await findHistoryForUser(req.userId);
    res.json({ history });
  })
);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on our end" });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const payload = token && verifyToken(token);

  if (!payload) {
    next(new Error("Unauthorized"));
    return;
  }

  socket.userId = payload.sub;
  next();
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id} (user ${socket.userId})`);

  socket.on("host:create_room", async (quiz, callback) => {
    const { error, value } = validateQuizPayload(quiz);
    if (error) {
      callback?.({ ok: false, error });
      return;
    }

    try {
      const savedQuiz = await createQuiz({ ...value, createdBy: socket.userId });

      const room = createRoom({
        hostSocketId: socket.id,
        hostUserId: socket.userId,
        quizId: savedQuiz.id,
        quiz: savedQuiz,
      });
      socket.join(room.code);
      callback?.({ ok: true, roomCode: room.code });
    } catch (err) {
      console.error("Failed to create room:", err);
      callback?.({ ok: false, error: "Could not create the quiz" });
    }
  });

  socket.on("player:join_room", (payload, callback) => {
    const { error, value } = validateJoinPayload(payload || {});
    if (error) {
      callback?.({ ok: false, error });
      return;
    }

    const room = getRoom(value.roomCode);
    if (!room) {
      callback?.({ ok: false, error: "Room not found" });
      return;
    }
    if (room.status !== "lobby") {
      callback?.({ ok: false, error: "This quiz has already started" });
      return;
    }

    addParticipant(room, socket.id, socket.userId, value.name);
    socket.join(room.code);

    callback?.({ ok: true });
    io.to(room.code).emit("room:participants_update", getParticipantsList(room));
  });

  socket.on("host:start_quiz", ({ roomCode } = {}) => {
    if (typeof roomCode !== "string") return;

    const room = getRoom(roomCode);
    if (!room || room.hostSocketId !== socket.id) return;
    if (room.status !== "lobby") return

    room.status = "active";
    room.currentQuestionIndex = -1;
    advanceToNextQuestion(room);
  });

  socket.on("player:submit_answer", ({ roomCode, optionIndexes } = {}) => {
    if (typeof roomCode !== "string" || !Array.isArray(optionIndexes)) return;

    const room = getRoom(roomCode);
    if (!room || room.status !== "active") return;

    const participant = room.participants.get(socket.id);
    if (!participant || participant.hasAnsweredCurrent) return;

    const question = getCurrentQuestion(room);
    if (!question) return;

    const validIndexes = optionIndexes
      .map(Number)
      .filter((i) => Number.isInteger(i) && i >= 0 && i < question.options.length);
    if (validIndexes.length === 0) return;

    participant.hasAnsweredCurrent = true;

    const selected = new Set(validIndexes);
    const correct = new Set(question.correctOptionIndexes);
    const isExactMatch =
      selected.size === correct.size && [...selected].every((i) => correct.has(i));

    if (isExactMatch) {
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
    const leaderboard = getLeaderboard(room);
    io.to(room.code).emit("quiz:finished", { leaderboard });

    createSession({
      quizId: room.quizId,
      roomCode: room.code,
      hostId: room.hostUserId,
      participants: leaderboard.map(({ userId, name, score }) => ({
        userId,
        name,
        score,
      })),
    }).catch((err) => console.error("Failed to save quiz session:", err));

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
      correctOptionIndexes: question.correctOptionIndexes,
      leaderboard: getLeaderboard(room),
    });
    advanceToNextQuestion(room);
  }, question.timeLimitSeconds * 1000);
}

async function start() {
  await initDb();
  httpServer.listen(PORT, () => {
    console.log(`Quiz server listening on http://localhost:${PORT}`);
  });
}

start();
