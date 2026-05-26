import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";


export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 5)));

    const notices = await prisma.notice.findMany({
        where: {
            author: {
                companyId: currentUser.companyId,
            }
        },
        select: {
            id: true,
            title: true,
            category: true,
            createdAt: true,
            author: {
                select: {
                    name: true,
                    position: true,
                    profilePic: true,
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
    });

    return NextResponse.json(notices);
}