import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

const USER_STATUSES = ["online", "offline", "AFK"] as const;

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json({ message: "로그인 정보 없음" }, { status: 401 })
    }

    const existingUser = await prisma.user.findFirst({
        where: { id: userId, },
        select: {
            companyId: true,
            role: true,
        }
    })

    if (!existingUser || existingUser.role !== "ADMIN") {
        return NextResponse.json(
            { message: "관리자 권한이 필요합니다." },
            { status: 403 }
        );
    }

    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department")?.trim();
    const position = searchParams.get("position")?.trim();
    const status = searchParams.get("status")?.trim();
    const keyword = searchParams.get("keyword")?.trim();

    const where: Prisma.UserWhereInput = {
        companyId: existingUser.companyId,
    }

    if (department) {
        where.department = department;
    }

    if (position) {
        where.position = position;
    }

    if (status) {
        if (!USER_STATUSES.includes(status as typeof USER_STATUSES[number])) {
            return NextResponse.json(
                { message: "올바르지 않은 상태값입니다." },
                { status: 400 },
            );
        }
        where.status = status as Prisma.EnumUserStatusFilter;
    }

    if (keyword) {
        where.OR = [
            { name: { contains: keyword, mode: "insensitive" } },
            { email: { contains: keyword, mode: "insensitive" } },
        ]
    }

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true,
            status: true,
            profilePic: true,
            createdAt: true,
            role: true,
        }
    })

    return NextResponse.json(users);
}