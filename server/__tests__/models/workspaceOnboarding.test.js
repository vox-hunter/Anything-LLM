const { WorkspaceOnboarding } = require("../../models/workspaceOnboarding");

describe("WorkspaceOnboarding", () => {
  describe("ONBOARDING_STEPS", () => {
    it("should have exactly 5 onboarding steps", () => {
      expect(WorkspaceOnboarding.ONBOARDING_STEPS).toHaveLength(5);
    });

    it("should contain all expected step keys", () => {
      expect(WorkspaceOnboarding.ONBOARDING_STEPS).toEqual([
        "uploadedDoc",
        "embeddedDoc",
        "sentFirstMessage",
        "configuredPrompt",
        "enabledAgentSkill",
      ]);
    });
  });

  describe("REQUIRED_STEPS", () => {
    it("should have exactly 4 required steps", () => {
      expect(WorkspaceOnboarding.REQUIRED_STEPS).toHaveLength(4);
    });

    it("should not include enabledAgentSkill as required", () => {
      expect(WorkspaceOnboarding.REQUIRED_STEPS).not.toContain(
        "enabledAgentSkill"
      );
    });

    it("should be a subset of ONBOARDING_STEPS", () => {
      for (const step of WorkspaceOnboarding.REQUIRED_STEPS) {
        expect(WorkspaceOnboarding.ONBOARDING_STEPS).toContain(step);
      }
    });
  });
});
