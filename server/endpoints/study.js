const { reqBody, userFromSession } = require("../utils/http");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { validWorkspaceSlug } = require("../utils/middleware/validWorkspace");
const { StudySession } = require("../models/studySession");
const {
  startStudySession,
  handleStudentResponse,
} = require("../utils/studyEngine");

function studyEndpoints(app) {
  if (!app) return;

  // Start a new study session for a workspace
  app.post(
    "/workspace/:slug/study/start",
    [validatedRequest, flexUserRoleValid([ROLES.all]), validWorkspaceSlug],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const workspace = response.locals.workspace;

        const {
          session,
          response: agResponse,
          error,
        } = await startStudySession(workspace, user);

        if (error) {
          return response.status(500).json({ success: false, error });
        }

        return response.status(200).json({
          success: true,
          session: {
            session_id: session.session_id,
            workspace_id: session.workspace_id,
            current_state: session.current_state,
            current_concept: session.current_concept,
            difficulty_level: session.difficulty_level,
          },
          response: agResponse,
        });
      } catch (e) {
        console.error("POST /study/start error:", e.message);
        return response.status(500).json({
          success: false,
          error: "Failed to start study session.",
        });
      }
    }
  );

  // Submit a student response in a study session
  app.post(
    "/workspace/:slug/study/respond",
    [validatedRequest, flexUserRoleValid([ROLES.all]), validWorkspaceSlug],
    async (request, response) => {
      try {
        const {
          session_id,
          component_id,
          student_input = {},
        } = reqBody(request);

        if (!session_id) {
          return response
            .status(400)
            .json({ success: false, error: "session_id is required." });
        }

        const {
          session,
          response: agResponse,
          error,
        } = await handleStudentResponse(session_id, {
          answer: student_input.answer || "",
          component_id: component_id || null,
          isCorrect: student_input.isCorrect || false,
          ...student_input,
        });

        if (error) {
          return response.status(500).json({ success: false, error });
        }

        return response.status(200).json({
          success: true,
          session: {
            session_id: session.session_id,
            workspace_id: session.workspace_id,
            current_state: session.current_state,
            current_concept: session.current_concept,
            difficulty_level: session.difficulty_level,
          },
          response: agResponse,
        });
      } catch (e) {
        console.error("POST /study/respond error:", e.message);
        return response.status(500).json({
          success: false,
          error: "Failed to process student response.",
        });
      }
    }
  );

  // Get an existing study session
  app.get(
    "/workspace/:slug/study/session/:sessionId",
    [validatedRequest, flexUserRoleValid([ROLES.all]), validWorkspaceSlug],
    async (request, response) => {
      try {
        const { sessionId } = request.params;
        const session = await StudySession.getBySessionId(sessionId);

        if (!session) {
          return response
            .status(404)
            .json({ success: false, error: "Session not found." });
        }

        return response.status(200).json({
          success: true,
          session: {
            session_id: session.session_id,
            workspace_id: session.workspace_id,
            current_state: session.current_state,
            current_concept: session.current_concept,
            difficulty_level: session.difficulty_level,
            concept_progress: StudySession.getConceptProgress(session),
            student_answers: StudySession.getStudentAnswers(session),
            createdAt: session.createdAt,
            lastUpdatedAt: session.lastUpdatedAt,
          },
        });
      } catch (e) {
        console.error("GET /study/session error:", e.message);
        return response.status(500).json({
          success: false,
          error: "Failed to retrieve study session.",
        });
      }
    }
  );
}

module.exports = { studyEndpoints };
