const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

export function cleanString(value, maxLength = 200) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function validateRegisterInput({ email, password, name }) {
  const cleanEmail = normalizeEmail(email);
  const cleanName = cleanString(name, 50);

  if (!cleanEmail || !password || !cleanName) {
    return { error: "email, password and name are all required" };
  }
  if (!isValidEmail(cleanEmail)) {
    return { error: "Enter a valid email address" };
  }
  if (typeof password !== "string" || password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }
  if (password.length > 200) {
    return { error: "Password is too long" };
  }

  return { value: { email: cleanEmail, password, name: cleanName } };
}

export function validateLoginInput({ email, password }) {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail || !password) {
    return { error: "email and password are required" };
  }
  return { value: { email: cleanEmail, password } };
}

export function validateQuizPayload(quiz) {
  if (!quiz || typeof quiz !== "object") {
    return { error: "Quiz data is missing" };
  }

  const title = cleanString(quiz.title, 100);
  if (!title) {
    return { error: "Quiz title is required" };
  }

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return { error: "Add at least one question" };
  }
  if (quiz.questions.length > 50) {
    return { error: "A quiz can have at most 50 questions" };
  }

  const cleanedQuestions = [];
  for (const [index, q] of quiz.questions.entries()) {
    const text = cleanString(q?.text, 300);
    if (!text) {
      return { error: `Question ${index + 1} is missing its text` };
    }

    const options = Array.isArray(q?.options)
      ? q.options.map((opt) => cleanString(opt, 150)).filter(Boolean)
      : [];
    if (options.length < 2) {
      return { error: `Question ${index + 1} needs at least 2 answer options` };
    }

    const answerType = q.answerType === "multiple" ? "multiple" : "single";

    const rawIndexes = Array.isArray(q?.correctOptionIndexes)
      ? q.correctOptionIndexes
      : Number.isInteger(q?.correctOptionIndex)
      ? [q.correctOptionIndex]
      : [];

    const correctOptionIndexes = [...new Set(rawIndexes.map(Number))]
      .filter((i) => Number.isInteger(i) && i >= 0 && i < options.length)
      .sort((a, b) => a - b);

    if (correctOptionIndexes.length === 0) {
      return { error: `Question ${index + 1} needs a correct answer selected` };
    }
    if (answerType === "single" && correctOptionIndexes.length > 1) {
      return { error: `Question ${index + 1} is Single Choice but has more than one correct answer` };
    }

    const timeLimitSeconds = Number(q?.timeLimitSeconds);
    if (!Number.isFinite(timeLimitSeconds) || timeLimitSeconds < 5 || timeLimitSeconds > 300) {
      return { error: `Question ${index + 1} needs a time limit between 5 and 300 seconds` };
    }

    cleanedQuestions.push({
      text,
      type: q.type === "image" ? "image" : "text",
      answerType,
      options,
      correctOptionIndexes,
      timeLimitSeconds,
    });
  }

  return {
    value: {
      title,
      category: cleanString(quiz.category, 50),
      questions: cleanedQuestions,
    },
  };
}

export function validateJoinPayload({ roomCode, name }) {
  const cleanCode = cleanString(roomCode, 6).toUpperCase();
  const cleanName = cleanString(name, 30);

  if (!cleanCode || cleanCode.length !== 6) {
    return { error: "Enter a valid 6-character room code" };
  }
  if (!cleanName) {
    return { error: "Enter your name" };
  }

  return { value: { roomCode: cleanCode, name: cleanName } };
}
