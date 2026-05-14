import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

// 관리자 페이지 전용 user API (예정)
export async function GET(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const existingUser = await prisma.user.findFirst({
        where: { id: userId, },
        select: { companyId: true }
    })

    if (!existingUser) {
        return NextResponse.json(
            { message: "사용자를 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));

    const department = searchParams.get("department");
    const position = searchParams.get("position");
    const keyword = searchParams.get("keyword");

    const where: Prisma.UserWhereInput = {
        companyId: existingUser.companyId,
    }

    if (department) {
        where.department = department;
    }

    if (position) {
        where.position = position;
    }

    if (keyword) {
        where.OR = [
            { name: { contains: keyword, mode: "insensitive" } },
            { email: { contains: keyword, mode: "insensitive" } },
            { department: { contains: keyword, mode: "insensitive" } },
            { position: { contains: keyword, mode: "insensitive" } },
        ]
    }

    const total = await prisma.user.count({
        where,
    });

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
        },
        orderBy: [
            { department: "asc" },
            { name: "asc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
    })


    return NextResponse.json({
        users,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    })
}