const prisma = require("../utils/prisma");

const ONBOARDING_STEPS = [
  "uploadedDoc",
  "embeddedDoc",
  "sentFirstMessage",
  "configuredPrompt",
  "enabledAgentSkill",
];

const REQUIRED_STEPS = [
  "uploadedDoc",
  "embeddedDoc",
  "sentFirstMessage",
  "configuredPrompt",
];

const WorkspaceOnboarding = {
  ONBOARDING_STEPS,
  REQUIRED_STEPS,

  /**
   * Get onboarding record for a workspace (creates one if it doesn't exist).
   * @param {number} workspaceId
   * @returns {Promise<object|null>}
   */
  getForWorkspace: async function (workspaceId) {
    try {
      let record = await prisma.workspace_onboarding.findUnique({
        where: { workspaceId: Number(workspaceId) },
      });

      if (!record) {
        record = await prisma.workspace_onboarding.create({
          data: { workspaceId: Number(workspaceId) },
        });
      }

      return record;
    } catch (error) {
      console.error("WorkspaceOnboarding.getForWorkspace", error.message);
      return null;
    }
  },

  /**
   * Mark a specific onboarding step as complete.
   * @param {number} workspaceId
   * @param {string} step - One of ONBOARDING_STEPS
   * @returns {Promise<object|null>}
   */
  completeStep: async function (workspaceId, step) {
    if (!ONBOARDING_STEPS.includes(step)) return null;

    try {
      const existing = await this.getForWorkspace(workspaceId);
      if (!existing) return null;

      const updateData = {
        [step]: true,
        lastUpdatedAt: new Date(),
      };

      // Check if all required steps are now complete
      const stepsAfterUpdate = {};
      for (const s of REQUIRED_STEPS) {
        stepsAfterUpdate[s] = s === step ? true : existing[s];
      }
      const allRequiredComplete = REQUIRED_STEPS.every(
        (s) => stepsAfterUpdate[s]
      );
      if (allRequiredComplete) {
        updateData.completed = true;
      }

      const record = await prisma.workspace_onboarding.update({
        where: { workspaceId: Number(workspaceId) },
        data: updateData,
      });

      return record;
    } catch (error) {
      console.error("WorkspaceOnboarding.completeStep", error.message);
      return null;
    }
  },

  /**
   * Mark the onboarding as skipped.
   * @param {number} workspaceId
   * @returns {Promise<object|null>}
   */
  skip: async function (workspaceId) {
    try {
      await this.getForWorkspace(workspaceId);

      const record = await prisma.workspace_onboarding.update({
        where: { workspaceId: Number(workspaceId) },
        data: {
          skipped: true,
          lastUpdatedAt: new Date(),
        },
      });

      return record;
    } catch (error) {
      console.error("WorkspaceOnboarding.skip", error.message);
      return null;
    }
  },

  /**
   * Delete onboarding record for a workspace.
   * @param {number} workspaceId
   * @returns {Promise<boolean>}
   */
  delete: async function (workspaceId) {
    try {
      await prisma.workspace_onboarding.deleteMany({
        where: { workspaceId: Number(workspaceId) },
      });
      return true;
    } catch (error) {
      console.error("WorkspaceOnboarding.delete", error.message);
      return false;
    }
  },
};

module.exports.WorkspaceOnboarding = WorkspaceOnboarding;
