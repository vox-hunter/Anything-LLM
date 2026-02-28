-- CreateTable
CREATE TABLE "workspace_onboarding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workspaceId" INTEGER NOT NULL,
    "uploadedDoc" BOOLEAN NOT NULL DEFAULT false,
    "embeddedDoc" BOOLEAN NOT NULL DEFAULT false,
    "sentFirstMessage" BOOLEAN NOT NULL DEFAULT false,
    "configuredPrompt" BOOLEAN NOT NULL DEFAULT false,
    "enabledAgentSkill" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workspace_onboarding_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_onboarding_workspaceId_key" ON "workspace_onboarding"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_onboarding_workspaceId_idx" ON "workspace_onboarding"("workspaceId");
