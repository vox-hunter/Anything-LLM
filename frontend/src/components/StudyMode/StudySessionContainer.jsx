import { useState, useRef, useEffect } from "react";
import StudySessionModel from "@/models/studySession";
import ComponentRenderer from "./ComponentRenderer";

const STATE_LABELS = {
  concept_introduction: "Introducing Concept",
  comprehension_question: "Comprehension Check",
  student_response: "Your Response",
  evaluation: "Evaluating",
  hint: "Here's a Hint",
  guided_retry: "Try Again",
  deeper_application: "Going Deeper",
  mastery_check: "Mastery Check",
  next_concept: "Next Concept",
};

export default function StudySessionContainer({ workspace }) {
  const [session, setSession] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [responses]);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await StudySessionModel.start(workspace.slug);
      if (result.success) {
        setSession(result.session);
        setResponses([result.response]);
      } else {
        setError(result.error || "Failed to start study session.");
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (payload) => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const result = await StudySessionModel.respond(workspace.slug, {
        session_id: session.session_id,
        component_id: payload.component_id,
        student_input: payload.student_input,
      });
      if (result.success) {
        setSession(result.session);
        setResponses((prev) => [...prev, result.response]);
      } else {
        setError(result.error || "Failed to process response.");
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Initial state - no session started
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-white text-2xl font-bold mb-2">Study Mode</h2>
          <p className="text-white/60 text-sm mb-6">
            Start an interactive study session powered by your uploaded
            documents. The AI tutor will guide you through concepts step by step
            using the Socratic method.
          </p>
          <button
            onClick={handleStart}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all"
          >
            {loading ? "Starting..." : "Begin Study Session"}
          </button>
          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs">📚 Study Mode</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs">
            {STATE_LABELS[session.current_state] || session.current_state}
          </span>
          <span className="text-white/30 text-xs">
            Level {session.difficulty_level}
          </span>
        </div>
        <button
          onClick={() => {
            setSession(null);
            setResponses([]);
          }}
          className="text-white/40 hover:text-white/70 text-xs transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Content area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {responses.map((resp, idx) => (
          <ComponentRenderer
            key={idx}
            data={resp}
            onSubmit={handleSubmit}
          />
        ))}
        {loading && (
          <div className="flex items-center gap-2 p-3">
            <div className="animate-pulse flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            <span className="text-white/40 text-sm">Thinking...</span>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Continue button for non-input components */}
      {!loading && responses.length > 0 && (
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() =>
              handleSubmit({
                component_id: null,
                student_input: { answer: "continue", isCorrect: true },
              })
            }
            className="w-full px-4 py-2 bg-theme-settings-input-bg hover:bg-white/10 text-white/70 rounded-lg text-sm transition-all"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
