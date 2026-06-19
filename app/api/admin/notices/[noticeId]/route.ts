import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { NoticeCategory } from "@prisma/client";
import { unlink } from "fs/promises";
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

    const body = await request.json();
    const { title, category, content, isPinned } = body;

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

    if (content !== undefined && typeof content !== "string") {
        return NextResponse.json(
            { message: "게시글 내용 형식이 올바르지 않습니다." },
            { status: 400 }
        );
    }

    if (!Object.values(NoticeCategory).includes(category as NoticeCategory)) {
        return NextResponse.json(
            { message: "올바르지 않은 카테고리 입니다." },
            { status: 400 }
        )
    }

    if (isPinned !== undefined && typeof isPinned !== "boolean") {
        return NextResponse.json(
            { message: "고정 여부 값이 올바르지 않습니다." },
            { status: 400 }
        );
    }

    const notice = await prisma.notice.findFirst({
        where: {
            id: noticeId,
            author: {
                companyId: admin.companyId,
            }
        },

    })

    if (!notice) {
        return NextResponse.json(
            { message: "해당 게시글을 찾을 수 없습니다." },
            { status: 404 }
        )
    }

    const updateNotice = await prisma.$transaction(async (tx) => {
        const result = await tx.notice.update({
            where: { id: noticeId },
            data: {
                title: title.trim(),
                category: category as NoticeCategory,
                ...(content !== undefined && { content }),
                ...(isPinned !== undefined && { isPinned })
            },
        });

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

    return NextResponse.json({
        updateNotice,
    })
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