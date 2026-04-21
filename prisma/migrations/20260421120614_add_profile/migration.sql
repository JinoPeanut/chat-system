-- CreateEnum
CREATE TYPE "ProfileWork" AS ENUM ('office', 'house');

-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "statusMsg" TEXT,
    "statusWork" "ProfileWork" NOT NULL,
    "bestWorker" BOOLEAN NOT NULL,
    "tel" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
