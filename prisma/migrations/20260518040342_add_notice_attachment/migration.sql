-- CreateTable
CREATE TABLE "NoticeAttachment" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NoticeAttachment" ADD CONSTRAINT "NoticeAttachment_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
