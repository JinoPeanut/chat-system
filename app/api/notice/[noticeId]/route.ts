import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: Promise<{ noticeId: string }> }) {
    const { noticeId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, },
    });

    if (!currentUser) {
        return NextResponse.json(
            { message: "사용자를 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const notice = await prisma.notice.findFirst({
        where: {
            id: noticeId,
            author: {
                companyId: currentUser.companyId,
            },
        },
        select: {
            id: true,
            authorId: true,
            title: true,
            category: true,
            createdAt: true,
            isPinned: true,
            content: true,
            author: {
                select: {
                    name: true,
                    profilePic: true,
                }
            },
            attachments: {
                select: {
                    id: true,
                    fileName: true,
                    fileUrl: true,
                    fileSize: true,
                    fileType: true,
                }
            }
        },
    });

    if (!notice) {
        return NextResponse.json(
            { message: "게시글을 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    return NextResponse.json(notice);
}