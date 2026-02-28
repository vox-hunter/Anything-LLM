/* eslint-env jest, node */

// Mock dependencies that require environment variables
jest.mock('../../../utils/helpers', () => ({
  getVectorDbClass: jest.fn(),
  getLLMProvider: jest.fn(),
}));
jest.mock('../../../utils/DocumentManager', () => ({
  DocumentManager: class {
    constructor() {
      this.pinnedDocs = jest.fn().mockReturnThis();
      this.then = jest.fn().mockResolvedValue([]);
    }
  }
}));
jest.mock('../../../models/workspace', () => ({
  Workspace: { get: jest.fn() }
}));
jest.mock('../../../models/studySession', () => ({
  StudySession: {
    getConceptProgress: jest.fn((session) => {
      try { return JSON.parse(session.concept_progress || '[]'); } catch { return []; }
    }),
    getStudentAnswers: jest.fn((session) => {
      try { return JSON.parse(session.student_answers || '[]'); } catch { return []; }
    }),
  }
}));

const { getNextState, buildTutorPrompt, TUTOR_SYSTEM_PROMPT } = require('../../../utils/studyEngine');

describe('Study Engine', () => {
  describe('getNextState', () => {
    it('should transition from concept_introduction to comprehension_question', () => {
      expect(getNextState('concept_introduction')).toBe('comprehension_question');
    });

    it('should transition from comprehension_question to student_response', () => {
      expect(getNextState('comprehension_question')).toBe('student_response');
    });

    it('should transition from student_response to evaluation', () => {
      expect(getNextState('student_response')).toBe('evaluation');
    });

    it('should transition from evaluation to deeper_application when correct', () => {
      expect(getNextState('evaluation', { isCorrect: true })).toBe('deeper_application');
    });

    it('should transition from evaluation to hint when incorrect', () => {
      expect(getNextState('evaluation', { isCorrect: false })).toBe('hint');
    });

    it('should transition from hint to guided_retry', () => {
      expect(getNextState('hint')).toBe('guided_retry');
    });

    it('should transition from guided_retry to evaluation', () => {
      expect(getNextState('guided_retry')).toBe('evaluation');
    });

    it('should transition from deeper_application to mastery_check', () => {
      expect(getNextState('deeper_application')).toBe('mastery_check');
    });

    it('should transition from mastery_check to next_concept', () => {
      expect(getNextState('mastery_check')).toBe('next_concept');
    });

    it('should transition from next_concept to concept_introduction', () => {
      expect(getNextState('next_concept')).toBe('concept_introduction');
    });

    it('should default to concept_introduction for unknown states', () => {
      expect(getNextState('unknown_state')).toBe('concept_introduction');
    });
  });

  describe('buildTutorPrompt', () => {
    const mockSession = {
      current_state: 'concept_introduction',
      current_concept: 'Photosynthesis',
      difficulty_level: 1,
      concept_progress: '["Cell Biology"]',
      student_answers: '[]',
    };

    it('should include the current learning state', () => {
      const prompt = buildTutorPrompt(mockSession, ['context text']);
      expect(prompt).toContain('Current learning state: concept_introduction');
    });

    it('should include the difficulty level', () => {
      const prompt = buildTutorPrompt(mockSession, ['context text']);
      expect(prompt).toContain('Difficulty level: 1');
    });

    it('should include the current concept', () => {
      const prompt = buildTutorPrompt(mockSession, ['context text']);
      expect(prompt).toContain('Current concept: Photosynthesis');
    });

    it('should include covered concepts', () => {
      const prompt = buildTutorPrompt(mockSession, ['context text']);
      expect(prompt).toContain('Concepts covered so far: Cell Biology');
    });

    it('should include context texts', () => {
      const prompt = buildTutorPrompt(mockSession, ['Document chunk 1', 'Document chunk 2']);
      expect(prompt).toContain('[CONTEXT 0]:\nDocument chunk 1');
      expect(prompt).toContain('[CONTEXT 1]:\nDocument chunk 2');
    });

    it('should include student input when provided', () => {
      const session = { ...mockSession, current_state: 'evaluation' };
      const prompt = buildTutorPrompt(session, ['context'], 'Produce glucose');
      expect(prompt).toContain('Produce glucose');
    });

    it('should produce instructions for concept_introduction state', () => {
      const prompt = buildTutorPrompt(mockSession, ['context']);
      expect(prompt).toContain('Introduce the next concept');
    });

    it('should produce instructions for comprehension_question state', () => {
      const session = { ...mockSession, current_state: 'comprehension_question' };
      const prompt = buildTutorPrompt(session, ['context']);
      expect(prompt).toContain('Ask a comprehension question');
    });

    it('should produce instructions for hint state', () => {
      const session = { ...mockSession, current_state: 'hint' };
      const prompt = buildTutorPrompt(session, ['context']);
      expect(prompt).toContain('Provide a helpful hint');
    });

    it('should always ask for valid JSON response', () => {
      const prompt = buildTutorPrompt(mockSession, ['context']);
      expect(prompt).toContain('Respond ONLY with a valid JSON object');
    });
  });

  describe('TUTOR_SYSTEM_PROMPT', () => {
    it('should enforce document-only knowledge boundary', () => {
      expect(TUTOR_SYSTEM_PROMPT).toContain('only teach using the provided retrieved document context');
    });

    it('should specify Socratic learning approach', () => {
      expect(TUTOR_SYSTEM_PROMPT).toContain('Socratic learning');
    });

    it('should include knowledge boundary refusal message', () => {
      expect(TUTOR_SYSTEM_PROMPT).toContain('This information is not present in the uploaded material');
    });

    it('should require AG-UI structured components', () => {
      expect(TUTOR_SYSTEM_PROMPT).toContain('a2ui_component');
      expect(TUTOR_SYSTEM_PROMPT).toContain('custom_component');
    });
  });
});
