const prisma = require("../utils/prisma");
const { v4: uuidv4 } = require("uuid");

const VALID_STATES = [
  "concept_introduction",
  "comprehension_question",
  "student_response",
  "evaluation",
  "hint",
  "guided_retry",
  "deeper_application",
  "mastery_check",
  "next_concept",
];

const StudySession = {
  validStates: VALID_STATES,

  /**
   * Create a new study session.
   * @param {Object} params
   * @param {number} params.workspaceId
   * @param {number|null} params.studentId
   * @returns {Promise<{session: Object|null, error: string|null}>}
   */
  create: async function ({ workspaceId, studentId = null }) {
    try {
      const session = await prisma.study_sessions.create({
        data: {
          session_id: uuidv4(),
          workspace_id: Number(workspaceId),
          student_id: studentId ? Number(studentId) : null,
          current_state: "concept_introduction",
          concept_progress: "[]",
          student_answers: "[]",
          difficulty_level: 1,
        },
      });
      return { session, error: null };
    } catch (error) {
      console.error("StudySession.create error:", error.message);
      return { session: null, error: error.message };
    }
  },

  /**
   * Get a study session by clause.
   * @param {Object} clause
   * @returns {Promise<Object|null>}
   */
  get: async function (clause = {}) {
    try {
      const session = await prisma.study_sessions.findFirst({
        where: clause,
      });
      return session || null;
    } catch (error) {
      console.error("StudySession.get error:", error.message);
      return null;
    }
  },

  /**
   * Get a study session by its session_id.
   * @param {string} sessionId
   * @returns {Promise<Object|null>}
   */
  getBySessionId: async function (sessionId) {
    return this.get({ session_id: sessionId });
  },

  /**
   * Update a study session.
   * @param {string} sessionId
   * @param {Object} data
   * @returns {Promise<{session: Object|null, error: string|null}>}
   */
  update: async function (sessionId, data = {}) {
    try {
      const session = await prisma.study_sessions.update({
        where: { session_id: sessionId },
        data: {
          ...data,
          lastUpdatedAt: new Date(),
        },
      });
      return { session, error: null };
    } catch (error) {
      console.error("StudySession.update error:", error.message);
      return { session: null, error: error.message };
    }
  },

  /**
   * Delete a study session by session_id.
   * @param {string} sessionId
   * @returns {Promise<boolean>}
   */
  delete: async function (sessionId) {
    try {
      await prisma.study_sessions.delete({
        where: { session_id: sessionId },
      });
      return true;
    } catch (error) {
      console.error("StudySession.delete error:", error.message);
      return false;
    }
  },

  /**
   * Advance the learning state machine to the next valid state.
   * @param {string} sessionId
   * @param {string} nextState
   * @returns {Promise<{session: Object|null, error: string|null}>}
   */
  advanceState: async function (sessionId, nextState) {
    if (!VALID_STATES.includes(nextState)) {
      return { session: null, error: `Invalid state: ${nextState}` };
    }
    return this.update(sessionId, { current_state: nextState });
  },

  /**
   * Add a student answer to the session.
   * @param {string} sessionId
   * @param {Object} answer
   * @returns {Promise<{session: Object|null, error: string|null}>}
   */
  addStudentAnswer: async function (sessionId, answer) {
    const session = await this.getBySessionId(sessionId);
    if (!session) return { session: null, error: "Session not found" };

    let answers = [];
    try {
      answers = JSON.parse(session.student_answers || "[]");
    } catch {
      answers = [];
    }
    answers.push(answer);

    return this.update(sessionId, {
      student_answers: JSON.stringify(answers),
    });
  },

  /**
   * Get parsed concept progress for a session.
   * @param {Object} session
   * @returns {Array}
   */
  getConceptProgress: function (session) {
    try {
      return JSON.parse(session.concept_progress || "[]");
    } catch {
      return [];
    }
  },

  /**
   * Get parsed student answers for a session.
   * @param {Object} session
   * @returns {Array}
   */
  getStudentAnswers: function (session) {
    try {
      return JSON.parse(session.student_answers || "[]");
    } catch {
      return [];
    }
  },
};

module.exports = { StudySession };
