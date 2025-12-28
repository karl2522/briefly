-- AlterTable
ALTER TABLE "quiz_sets" ADD COLUMN     "folderId" TEXT;

-- CreateIndex
CREATE INDEX "quiz_sets_folderId_idx" ON "quiz_sets"("folderId");

-- AddForeignKey
ALTER TABLE "quiz_sets" ADD CONSTRAINT "quiz_sets_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
