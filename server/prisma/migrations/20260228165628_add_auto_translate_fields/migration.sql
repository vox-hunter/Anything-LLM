-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN "autoTranslateLanguage" TEXT;
ALTER TABLE "workspaces" ADD COLUMN "autoTranslateResponses" BOOLEAN DEFAULT false;
