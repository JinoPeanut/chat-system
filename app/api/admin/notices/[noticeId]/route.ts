import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { NoticeCategory } from "@prisma/client";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export async function PATCH(request: Request, { params }: { params: Promise<{ noticeId: string }> }) {
    const { noticeId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json({ message: "로그인 정보 없음" }, { status: 401 })
    }

    const admin = await prisma.user.findFirst({
        where: { id: userId, },
        select: {
            companyId: true,
            role: true,
        }
    })

    if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json(
            { message: "관리자 권한이 필요합니다." },
            { status: 403 }
        );
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const category = formData.get("category");
    const content = formData.get("content");
    const isPinned = formData.get("isPinned");
    const files = formData.getAll("files");
    const deletedAttachmentIds =
        formData.getAll("deletedAttachmentIds");

    // isPinned 가 formData 로 잘 받아졌는지 확인 (formData 는 항상 문자열로 저장해 받아옴)
    if (typeof isPinned !== "string" || !["true", "false"].includes(isPinned)) {
        return NextResponse.json(
            { message: "고정 여부 값이 올바르지 않습니다." },
            { status: 400 }
        )
    }

    // 문자열로 변환된 isPinned 를 다시 boolean 으로 반환하기 위한 값
    const isPinnedValue = isPinned === "true";

    if (
        typeof title !== "string" ||
        typeof category !== "string"
    ) {
        return NextResponse.json(
            { message: "제목과 카테고리 형식이 올바르지 않습니다." },
            { status: 400 }
        );
    }

    if (!title.trim() || !category.trim()) {
        return NextResponse.json(
            { message: "제목과 카테고리는 필수입니다." },
            { status: 400 }
        );
    }

    if (content !== null && typeof content !== "string") {
        return NextResponse.json(
            { message: "게시글 내용 형식이 올바르지 않습니다." },
            { status: 400 }
        );
    }

    const contentValue = typeof content === "string" ? content : null;

    if (!Object.values(NoticeCategory).includes(category as NoticeCategory)) {
        return NextResponse.json(
            { message: "올바르지 않은 카테고리 입니다." },
            { status: 400 }
        )
    }

    const uploadedFiles = files.filter(
        (file): file is File => file instanceof File
    );

    const deletedAttachmentIdList = deletedAttachmentIds.filter(
        (id): id is string =>
            typeof id === "string" && id.trim() !== ""
    );

    const notice = await prisma.notice.findFirst({
        where: {
            id: noticeId,
            author: {
                companyId: admin.companyId,
            }
        },
        select: {
            id: true,
        },
    })

    if (!notice) {
        return NextResponse.json(
            { message: "해당 게시글을 찾을 수 없습니다." },
            { status: 404 }
        )
    }

    const attachmentsToDelete = await prisma.noticeAttachment.findMany({
        where: {
            id: {
                in: deletedAttachmentIdList,
            },
            noticeId,
        },
        select: {
            id: true,
            fileUrl: true,
        }
    })

    const updateNotice = await prisma.$transaction(async (tx) => {
        const result = await tx.notice.update({
            where: { id: noticeId },
            data: {
                title: title.trim(),
                category: category as NoticeCategory,
                content: contentValue,
                isPinned: isPinnedValue,
            },
        });

        if (attachmentsToDelete.length > 0) {
            await tx.noticeAttachment.deleteMany({
                where: {
                    id: {
                        in: attachmentsToDelete.map((file) => file.id)
                    },
                    noticeId,
                }
            })
        }

        if (uploadedFiles.length > 0) {
            const uploadDir = path.join(
                process.cwd(),
                "public",
                "uploads",
                "notices"
            );

            await mkdir(uploadDir, { recursive: true });

            for (const file of uploadedFiles) {
                const bytes = await file.arrayBuffer();
                const safeFileName =
                    `${crypto.randomUUID()}-${file.name}`;

                await writeFile(
                    path.join(uploadDir, safeFileName),
                    Buffer.from(bytes)
                );

                await tx.noticeAttachment.create({
                    data: {
                        noticeId,
                        fileName: file.name,
                        fileUrl: `/uploads/notices/${safeFileName}`,
                        fileSize: file.size,
                        fileType: file.type,
                    },
                });
            }
        }

        await tx.adminActivityLog.create({
            data: {
                adminId: userId,
                companyId: admin.companyId,
                type: "default",
                message: `관리자가 게시글 '${result.title}'을 수정했습니다.`,
                targetId: result.id,
                targetType: "notice",
            },
        });

        return result;
    })

    await Promise.all(
        attachmentsToDelete.map(async (file) => {
            const filePath = path.join(
                process.cwd(),
                "public",
                file.fileUrl.replace(/^\/+/, "")
            );

            try {
                await unlink(filePath);
            } catch (error) {
                console.error(
                    "기존 첨부파일 삭제 실패: ",
                    filePath,
                    error
                )
            }
        })
    )

    return NextResponse.json(updateNotice)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ noticeId: string }> }) {
    const { noticeId } = await params;

    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json({ message: "로그인 정보 없음" }, { status: 401 })
    }

    const admin = await prisma.user.findFirst({
        where: { id: userId, },
        select: {
            companyId: true,
            role: true,
        }
    })

    if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json(
            { message: "관리자 권한이 필요합니다." },
            { status: 403 }
        );
    }

    const targetNotice = await prisma.notice.findFirst({
        where: {
            id: noticeId,
            author: {
                companyId: admin.companyId,
            }
        },
        select: {
            id: true,
            title: true,
            attachments: {
                select: {
                    fileUrl: true,
                }
            }
        }
    });

    if (!targetNotice) {
        return NextResponse.json(
            { message: "찾을 수 없는 게시글 입니다." },
            { status: 404 }
        )
    }

    const notice = await prisma.$transaction(async (tx) => {

        const result = await tx.notice.delete({
            where: { id: noticeId }
        })

        await tx.adminActivityLog.create({
            data: {
                adminId: userId,
                companyId: admin.companyId,
                type: "notice",
                message: `관리자가 게시글 ${result.title}을 삭제했습니다.`,
                targetId: result.id,
                targetType: "notice",
            }
        })

        return result;
    })

    await Promise.all(
        targetNotice.attachments.map(async (attachment) => {
            const filePath = path.join(
                process.cwd(),
                "public",
                attachment.fileUrl.replace(/^\/+/, "")
            );

            try {
                await unlink(filePath);
            } catch (error) {
                console.log("첨부파일 삭제 실패: ", filePath, error);
            }
        })
    );

    return NextResponse.json({
        message: "게시글이 삭제 되었습니다.",
        notice,
    })
}