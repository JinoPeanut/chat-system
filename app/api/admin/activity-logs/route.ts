import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            companyId: true,
            role: true,
        }
    });

    if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json(
            { message: "관리자 권한이 필요합니다." },
            { status: 403 }
        );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 5)));

    const logs = await prisma.adminActivityLog.findMany({
        where: {
            companyId: admin.companyId,
        },
        select: {
            id: true,
            type: true,
            message: true,
            targetId: true,
            targetType: true,
            createdAt: true,
            admin: {
                select: {
                    id: true,
                    name: true,
                    profilePic: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
    });

    return NextResponse.json({
        logs,
    });
}