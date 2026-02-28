-- CreateTable
CREATE TABLE "study_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "session_id" TEXT NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    "student_id" INTEGER,
    "current_concept" TEXT,
    "current_state" TEXT NOT NULL DEFAULT 'concept_introduction',
    "concept_progress" TEXT DEFAULT '[]',
    "student_answers" TEXT DEFAULT '[]',
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "study_sessions_session_id_key" ON "study_sessions"("session_id");

-- CreateIndex
CREATE INDEX "study_sessions_workspace_id_idx" ON "study_sessions"("workspace_id");

-- CreateIndex
CREATE INDEX "study_sessions_student_id_idx" ON "study_sessions"("student_id");
