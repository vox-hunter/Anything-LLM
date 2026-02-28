-- CreateTable
CREATE TABLE "message_reactions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chatId" INTEGER NOT NULL,
    "userId" INTEGER,
    "reaction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "message_reactions_chatId_idx" ON "message_reactions"("chatId");

-- CreateIndex
CREATE INDEX "message_reactions_reaction_idx" ON "message_reactions"("reaction");
