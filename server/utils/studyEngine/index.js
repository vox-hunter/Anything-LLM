const { v4: uuidv4 } = require("uuid");
const { StudySession } = require("../../models/studySession");
const { Workspace } = require("../../models/workspace");
const { getVectorDbClass, getLLMProvider } = require("../helpers");
const { DocumentManager } = require("../DocumentManager");

const TUTOR_SYSTEM_PROMPT = `You are an expert teacher using Socratic learning.

You must only teach using the provided retrieved document context.

Do not introduce any information outside the provided material.

If the required information is not present in the retrieved context, respond with:
"This information is not present in the uploaded material."

Prefer questions, exercises, and interactive learning components.

Use the learning state machine to guide the student.

Return responses using AG-UI structured components as JSON.

Your response MUST be valid JSON matching one of these formats:

For built-in components (multiple_choice, flashcard, concept_explainer, short_answer, hint, diagram, fill_in_blank):
{
  "type": "a2ui_component",
  "component": "<component_type>",
  "content": { ... component-specific fields ... }
}

For custom interactive components:
{
  "type": "custom_component",
  "name": "<component_name>",
  "description": "<what the component does>",
  "props": { ... },
  "inputs": [ { "id": "<input_id>", "type": "<input_type>", "description": "<description>" } ]
}

Component-specific content fields:

multiple_choice: { "question": "...", "options": ["A","B","C","D"], "correct_answer": "A" }
flashcard: { "front": "...", "back": "..." }
concept_explainer: { "title": "...", "explanation": "...", "key_points": ["..."] }
short_answer: { "question": "...", "expected_keywords": ["..."] }
hint: { "message": "..." }
diagram: { "title": "...", "description": "...", "elements": ["..."] }
fill_in_blank: { "sentence": "The ___ is responsible for ...", "blank_answer": "..." }`;

/**
 * Determines the next state in the learning state machine based on
 * the current state and the student's input/evaluation result.
 * @param {string} currentState
 * @param {Object} evaluationContext - { isCorrect, hasRetried }
 * @returns {string}
 */
function getNextState(currentState, evaluationContext = {}) {
  const { isCorrect = false, hasRetried = false } = evaluationContext;

  const transitions = {
    concept_introduction: "comprehension_question",
    comprehension_question: "student_response",
    student_response: "evaluation",
    evaluation: isCorrect ? "deeper_application" : "hint",
    hint: "guided_retry",
    guided_retry: "evaluation",
    deeper_application: "mastery_check",
    mastery_check: "next_concept",
    next_concept: "concept_introduction",
  };

  return transitions[currentState] || "concept_introduction";
}

/**
 * Build the prompt for the tutor agent based on the current session state.
 * @param {Object} session - The study session object
 * @param {string[]} contextTexts - Retrieved document chunks
 * @param {string} studentInput - The student's latest input
 * @returns {string}
 */
function buildTutorPrompt(session, contextTexts, studentInput = "") {
  const conceptProgress = StudySession.getConceptProgress(session);
  const studentAnswers = StudySession.getStudentAnswers(session);

  let prompt = `Current learning state: ${session.current_state}\n`;
  prompt += `Difficulty level: ${session.difficulty_level}\n`;

  if (session.current_concept) {
    prompt += `Current concept: ${session.current_concept}\n`;
  }

  if (conceptProgress.length > 0) {
    prompt += `Concepts covered so far: ${conceptProgress.join(", ")}\n`;
  }

  if (studentAnswers.length > 0) {
    const recentAnswers = studentAnswers.slice(-3);
    prompt += `Recent student answers: ${JSON.stringify(recentAnswers)}\n`;
  }

  prompt += `\nRetrieved document context:\n`;
  contextTexts.forEach((text, i) => {
    prompt += `[CONTEXT ${i}]:\n${text}\n[END CONTEXT ${i}]\n\n`;
  });

  switch (session.current_state) {
    case "concept_introduction":
      prompt +=
        "\nIntroduce the next concept from the document material using a concept_explainer component.";
      break;
    case "comprehension_question":
      prompt +=
        "\nAsk a comprehension question about the current concept using a multiple_choice or short_answer component.";
      break;
    case "student_response":
      prompt += `\nThe student responded: "${studentInput}". Evaluate their answer.`;
      break;
    case "evaluation":
      prompt += `\nEvaluate the student's answer: "${studentInput}". If correct, acknowledge and prepare a harder question. If incorrect, provide a hint.`;
      break;
    case "hint":
      prompt +=
        "\nProvide a helpful hint about the current concept using a hint component.";
      break;
    case "guided_retry":
      prompt +=
        "\nAsk the same or similar question again for the student to retry, using a multiple_choice or short_answer component.";
      break;
    case "deeper_application":
      prompt +=
        "\nAsk a deeper application question that tests understanding at a higher level.";
      break;
    case "mastery_check":
      prompt +=
        "\nPerform a mastery check. Ask a comprehensive question to verify understanding before moving on.";
      break;
    case "next_concept":
      prompt +=
        "\nMove to the next concept from the document material. Use a concept_explainer to introduce it.";
      break;
    default:
      prompt += "\nIntroduce a concept from the document material.";
  }

  prompt +=
    "\n\nRespond ONLY with a valid JSON object matching the AG-UI component schema. Do not include any text outside the JSON.";

  return prompt;
}

/**
 * Retrieve relevant document context from the workspace vector store.
 * @param {Object} workspace
 * @param {string} query
 * @returns {Promise<{contextTexts: string[], sources: Object[]}>}
 */
async function retrieveDocumentContext(workspace, query) {
  const LLMConnector = getLLMProvider({
    provider: workspace?.chatProvider,
    model: workspace?.chatModel,
  });
  const VectorDb = getVectorDbClass();

  let contextTexts = [];
  let sources = [];

  // Get pinned documents
  await new DocumentManager({
    workspace,
    maxTokens: LLMConnector.promptWindowLimit(),
  })
    .pinnedDocs()
    .then((pinnedDocs) => {
      pinnedDocs.forEach((doc) => {
        const { pageContent, ...metadata } = doc;
        contextTexts.push(doc.pageContent);
        sources.push({
          text:
            pageContent.slice(0, 1_000) +
            "...continued on in source document...",
          ...metadata,
        });
      });
    });

  // Perform similarity search
  const hasVectorizedSpace = await VectorDb.hasNamespace(workspace.slug);
  const embeddingsCount = await VectorDb.namespaceCount(workspace.slug);

  if (hasVectorizedSpace && embeddingsCount > 0) {
    const searchQuery = query || "main concepts and key topics";
    const vectorSearchResults = await VectorDb.performSimilaritySearch({
      namespace: workspace.slug,
      input: searchQuery,
      LLMConnector,
      similarityThreshold: workspace?.similarityThreshold,
      topN: workspace?.topN || 4,
      filterIdentifiers: [],
    });

    if (!vectorSearchResults.message) {
      contextTexts = [...contextTexts, ...vectorSearchResults.contextTexts];
      sources = [...sources, ...vectorSearchResults.sources];
    }
  }

  return { contextTexts, sources };
}

/**
 * Invoke the tutor agent with session state and context.
 * @param {Object} workspace
 * @param {Object} session
 * @param {string[]} contextTexts
 * @param {string} studentInput
 * @returns {Promise<Object>} - The AG-UI response object
 */
async function invokeTutorAgent(
  workspace,
  session,
  contextTexts,
  studentInput = ""
) {
  // If no context available, enforce knowledge boundary
  if (!contextTexts || contextTexts.length === 0) {
    return {
      type: "a2ui_component",
      component: "concept_explainer",
      content: {
        title: "No Material Available",
        explanation:
          "This information is not present in the uploaded material. Please upload study materials to this workspace first.",
        key_points: [],
      },
    };
  }

  const LLMConnector = getLLMProvider({
    provider: workspace?.chatProvider,
    model: workspace?.chatModel,
  });

  const tutorPrompt = buildTutorPrompt(session, contextTexts, studentInput);

  const messages = [
    { role: "system", content: TUTOR_SYSTEM_PROMPT },
    { role: "user", content: tutorPrompt },
  ];

  try {
    const { textResponse } = await LLMConnector.getChatCompletion(messages, {
      temperature: workspace?.openAiTemp ?? 0.7,
    });

    // Try to parse as JSON
    if (textResponse) {
      try {
        // Extract JSON from response (handle cases where LLM wraps in markdown)
        let jsonStr = textResponse.trim();
        if (jsonStr.startsWith("```json")) {
          jsonStr = jsonStr.slice(7);
        }
        if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith("```")) {
          jsonStr = jsonStr.slice(0, -3);
        }
        jsonStr = jsonStr.trim();

        const parsed = JSON.parse(jsonStr);
        // Ensure component_id is present
        if (!parsed.component_id) {
          parsed.component_id = uuidv4();
        }
        return parsed;
      } catch {
        // If JSON parsing fails, wrap in a concept_explainer
        return {
          type: "a2ui_component",
          component: "concept_explainer",
          component_id: uuidv4(),
          content: {
            title: "Study Material",
            explanation: textResponse,
            key_points: [],
          },
        };
      }
    }

    return {
      type: "a2ui_component",
      component: "concept_explainer",
      component_id: uuidv4(),
      content: {
        title: "Error",
        explanation: "Unable to generate a response. Please try again.",
        key_points: [],
      },
    };
  } catch (error) {
    console.error("invokeTutorAgent error:", error.message);
    return {
      type: "a2ui_component",
      component: "concept_explainer",
      component_id: uuidv4(),
      content: {
        title: "Error",
        explanation: "An error occurred while generating the study content.",
        key_points: [],
      },
    };
  }
}

/**
 * Start a new study session for a workspace.
 * @param {Object} workspace
 * @param {Object|null} user
 * @returns {Promise<{session: Object, response: Object, error: string|null}>}
 */
async function startStudySession(workspace, user = null) {
  const { session, error } = await StudySession.create({
    workspaceId: workspace.id,
    studentId: user?.id || null,
  });

  if (error) {
    return { session: null, response: null, error };
  }

  const { contextTexts } = await retrieveDocumentContext(
    workspace,
    "main concepts key topics overview introduction"
  );
  const agResponse = await invokeTutorAgent(
    workspace,
    session,
    contextTexts,
    ""
  );

  return { session, response: agResponse, error: null };
}

/**
 * Handle a student response in a study session.
 * @param {string} sessionId
 * @param {Object} studentInput - { answer, component_id }
 * @returns {Promise<{session: Object, response: Object, error: string|null}>}
 */
async function handleStudentResponse(sessionId, studentInput = {}) {
  const session = await StudySession.getBySessionId(sessionId);
  if (!session) {
    return { session: null, response: null, error: "Session not found" };
  }

  const workspace = await Workspace.get({ id: session.workspace_id });
  if (!workspace) {
    return { session: null, response: null, error: "Workspace not found" };
  }

  // Record the student answer
  await StudySession.addStudentAnswer(sessionId, {
    ...studentInput,
    timestamp: new Date().toISOString(),
    state: session.current_state,
  });

  // Determine next state
  const nextState = getNextState(session.current_state, {
    isCorrect: studentInput.isCorrect || false,
    hasRetried: session.current_state === "guided_retry",
  });

  // Advance state
  const { session: updatedSession, error } = await StudySession.advanceState(
    sessionId,
    nextState
  );
  if (error) {
    return { session: null, response: null, error };
  }

  // Retrieve context and generate next AG-UI response
  const { contextTexts } = await retrieveDocumentContext(
    workspace,
    studentInput.answer || session.current_concept || "study material"
  );
  const agResponse = await invokeTutorAgent(
    workspace,
    updatedSession,
    contextTexts,
    studentInput.answer || ""
  );

  return { session: updatedSession, response: agResponse, error: null };
}

module.exports = {
  startStudySession,
  handleStudentResponse,
  retrieveDocumentContext,
  invokeTutorAgent,
  buildTutorPrompt,
  getNextState,
  TUTOR_SYSTEM_PROMPT,
};
