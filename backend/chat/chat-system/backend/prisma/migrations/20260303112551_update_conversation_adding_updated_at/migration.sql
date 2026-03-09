-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Conversation_updated_at_idx" ON "Conversation"("updated_at");
