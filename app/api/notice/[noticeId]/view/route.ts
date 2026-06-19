import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(_request: Request, { params }: { params: Promise<{ noticeId: string }> }) {
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
        where: {
            id: userId,
        },
        select: {
            companyId: true,
        },
    });

    if (!currentUser) {
        return NextResponse.json(
            { message: "사용자를 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const existingNotice = await prisma.notice.findFirst({
        where: {
            id: noticeId,
            author: {
                companyId: currentUser.companyId,
            },
        },
        select: {
            id: true,
        },
    });

    if (!existingNotice) {
        return NextResponse.json(
            { message: "게시글을 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const updatedNotice = await prisma.notice.update({
        where: {
            id: noticeId,
        },
        data: {
            viewCount: {
                increment: 1,
            },
        },
        select: {
            viewCount: true,
        },
    });

    return NextResponse.json({
        viewCount: updatedNotice.viewCount,
    });
}