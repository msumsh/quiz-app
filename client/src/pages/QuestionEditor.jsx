import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import colors from "../theme";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.85;

let nextQuestionId = 1;
let nextOptionId = 1;

function makeBlankQuestion() {
  return {
    id: nextQuestionId++,
    text: "",
    type: "text",
    imageUrl: null,
    imageName: "",
    answerType: "single",
    options: [
      { id: nextOptionId++, text: "" },
      { id: nextOptionId++, text: "" },
      { id: nextOptionId++, text: "" },
      { id: nextOptionId++, text: "" },
    ],
    correctOptionIds: [],
  };
}

function normalizeImageToJpeg(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("This image format isn't supported — try a JPEG or PNG file"));
    };

    img.src = objectUrl;
  });
}

export default function QuestionEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const quizMeta = location.state;

  useEffect(() => {
    if (!quizMeta) navigate("/create-quiz", { replace: true });
  }, [quizMeta, navigate]);

  const [questions, setQuestions] = useState([makeBlankQuestion()]);
  const [activeId, setActiveId] = useState(questions[0].id);
  const [error, setError] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const activeIndex = questions.findIndex((q) => q.id === activeId);
  const activeQuestion = questions[activeIndex];

  const updateActiveQuestion = (changes) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === activeId ? { ...q, ...changes } : q))
    );
  };

  const handleImageSelect = async (file) => {
    if (!file) {
      updateActiveQuestion({ imageUrl: null, imageName: "" });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image is too large — please use one under 8MB");
      return;
    }

    setError("");
    setIsProcessingImage(true);
    try {
      const dataUrl = await normalizeImageToJpeg(file);
      updateActiveQuestion({ imageUrl: dataUrl, imageName: file.name });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const updateOption = (optionId, text) => {
    updateActiveQuestion({
      options: activeQuestion.options.map((opt) =>
        opt.id === optionId ? { ...opt, text } : opt
      ),
    });
  };

  const handleAnswerTypeChange = (answerType) => {
    updateActiveQuestion({ answerType, correctOptionIds: [] });
  };

  const handleToggleCorrect = (optionId) => {
    if (activeQuestion.answerType === "single") {
      updateActiveQuestion({ correctOptionIds: [optionId] });
    } else {
      const isAlreadyCorrect = activeQuestion.correctOptionIds.includes(optionId);
      const updated = isAlreadyCorrect
        ? activeQuestion.correctOptionIds.filter((id) => id !== optionId)
        : [...activeQuestion.correctOptionIds, optionId];
      updateActiveQuestion({ correctOptionIds: updated });
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = makeBlankQuestion();
    setQuestions((prev) => [...prev, newQuestion]);
    setActiveId(newQuestion.id);
  };

  const handleRemoveQuestion = () => {
    if (questions.length === 1) return;
    const remaining = questions.filter((q) => q.id !== activeId);
    setQuestions(remaining);
    setActiveId(remaining[0].id);
  };

  const handleFinish = () => {
    setError("");

    for (const [index, q] of questions.entries()) {
      if (!q.text.trim()) {
        setError(`Question ${index + 1} needs some text`);
        setActiveId(q.id);
        return;
      }

      if (q.type === "image" && !q.imageUrl) {
        setError(`Question ${index + 1} needs an image`);
        setActiveId(q.id);
        return;
      }

      const filledOptions = q.options.filter((opt) => opt.text.trim());
      if (filledOptions.length < 2) {
        setError(`Question ${index + 1} needs at least 2 answer options filled in`);
        setActiveId(q.id);
        return;
      }

      const hasCorrectAnswer = q.options.some(
        (opt) => opt.text.trim() && q.correctOptionIds.includes(opt.id)
      );
      if (!hasCorrectAnswer) {
        setError(`Question ${index + 1} needs a correct answer selected`);
        setActiveId(q.id);
        return;
      }
    }

    const quiz = {
      title: quizMeta.title,
      category: quizMeta.category,
      questions: questions.map((q) => {
        const filledOptions = q.options.filter((opt) => opt.text.trim());
        const correctOptionIndexes = filledOptions
          .map((opt, i) => (q.correctOptionIds.includes(opt.id) ? i : -1))
          .filter((i) => i !== -1);

        return {
          text: q.text.trim(),
          type: q.type,
          imageUrl: q.type === "image" ? q.imageUrl : null,
          answerType: q.answerType,
          options: filledOptions.map((opt) => opt.text.trim()),
          correctOptionIndexes,
          timeLimitSeconds: quizMeta.timeLimit,
        };
      }),
    };

    navigate("/lobby", { state: { quiz } });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgPage }}>
      <Navbar />

      <div
        style={{
          padding: 24,
          display: "flex",
          gap: 16,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* Sidebar: question list */}
        <div
          style={{
            width: 220,
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 700, color: colors.textWhite, marginBottom: 12 }}>
            Questions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setActiveId(q.id)}
                style={{
                  textAlign: "left",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                  backgroundColor:
                    q.id === activeId ? colors.purple : colors.bgInput,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: colors.textWhite,
                  }}
                >
                  Q{index + 1}. {q.text || "Question text"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: q.id === activeId ? "#e5d9ff" : colors.textGray,
                  }}
                >
                  {q.type === "text" ? "Text" : "Image"} ·{" "}
                  {q.answerType === "single" ? "Single Choice" : "Multiple Choice"}
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={handleAddQuestion} style={addButtonStyle}>
              + Add
            </button>
            <button onClick={handleRemoveQuestion} style={removeButtonStyle}>
              - Remove
            </button>
          </div>
        </div>

        {/* Question builder */}
        <div
          style={{
            flex: 1,
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <input
            value={activeQuestion.text}
            onChange={(e) => updateActiveQuestion({ text: e.target.value })}
            placeholder="Enter question text..."
            style={inputStyle}
          />

          {/* Text / Image toggle */}
          <div style={switchContainerStyle}>
            <button
              onClick={() => updateActiveQuestion({ type: "text" })}
              style={typeButtonStyle(activeQuestion.type === "text")}
            >
              Text
            </button>
            <button
              onClick={() => updateActiveQuestion({ type: "image" })}
              style={typeButtonStyle(activeQuestion.type === "image")}
            >
              Image
            </button>
          </div>

          {activeQuestion.type === "image" && (
            <label
              style={{
                border: `1px dashed ${colors.borderInput}`,
                borderRadius: 8,
                padding: activeQuestion.imageUrl ? 12 : "40px 0",
                textAlign: "center",
                color: colors.textGray,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {isProcessingImage ? (
                "Processing image..."
              ) : activeQuestion.imageUrl ? (
                <img
                  src={activeQuestion.imageUrl}
                  alt={activeQuestion.imageName}
                  style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 6 }}
                />
              ) : (
                "Drop image here"
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e.target.files[0] || null)}
                style={{ display: "none" }}
              />
            </label>
          )}

          {/* Single Choice / Multiple Choice toggle */}
          <div>
            <div style={switchContainerStyle}>
              <button
                onClick={() => handleAnswerTypeChange("single")}
                style={typeButtonStyle(activeQuestion.answerType === "single")}
              >
                Single Choice
              </button>
              <button
                onClick={() => handleAnswerTypeChange("multiple")}
                style={typeButtonStyle(activeQuestion.answerType === "multiple")}
              >
                Multiple Choice
              </button>
            </div>
          </div>

          {/* Answer options */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {activeQuestion.options.map((opt, i) => (
              <div
                key={opt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: colors.bgInput,
                  border: `1px solid ${colors.borderInput}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                <input
                  type={activeQuestion.answerType === "single" ? "radio" : "checkbox"}
                  name={`correct-${activeQuestion.id}`}
                  checked={activeQuestion.correctOptionIds.includes(opt.id)}
                  onChange={() => handleToggleCorrect(opt.id)}
                />
                <input
                  value={opt.text}
                  onChange={(e) => updateOption(opt.id, e.target.value)}
                  placeholder={`Answer Option ${i + 1}`}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: colors.textWhite,
                    fontSize: 13,
                  }}
                />
              </div>
            ))}
          </div>

          {error && (
            <div style={{ fontSize: 12, color: colors.red }}>{error}</div>
          )}

          <button
            onClick={handleFinish}
            disabled={isProcessingImage}
            style={{ ...submitButtonStyle, opacity: isProcessingImage ? 0.6 : 1 }}
          >
            {activeIndex === questions.length - 1
              ? "Create Lobby"
              : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  backgroundColor: colors.bgInput,
  border: `1px solid ${colors.borderInput}`,
  borderRadius: 8,
  padding: "10px 12px",
  color: colors.textWhite,
  fontSize: 14,
  outline: "none",
};

const typeButtonStyle = (isActive) => ({
  border: "none",                  
  borderRadius: 16,                
  padding: "6px 16px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  backgroundColor: isActive ? colors.purple : "transparent",
  color: isActive ? colors.textWhite : colors.textGray,
  transition: "all 0.2s ease",
});

const addButtonStyle = {
  flex: 1,
  border: `1px solid ${colors.green}`,
  borderRadius: 6,
  padding: "8px 0",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  backgroundColor: "transparent",
  color: colors.green,
};

const removeButtonStyle = {
  flex: 1,
  border: `1px solid ${colors.red}`,
  borderRadius: 6,
  padding: "8px 0",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  backgroundColor: "transparent",
  color: colors.red,
};

const submitButtonStyle = {
  marginTop: "auto",
  padding: "12px 0",
  border: "none",
  borderRadius: 8,
  backgroundColor: colors.purple,
  color: colors.textWhite,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const switchContainerStyle = {
  display: "flex",
  backgroundColor: colors.bgInput, 
  borderRadius: 20,                
  padding: 0,                      
  width: "fit-content",            
};