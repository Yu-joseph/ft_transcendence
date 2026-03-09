-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Online';
