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
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 7)));
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
            role: true,
            profile: true,
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
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    });
}

export async function PATCH(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json({ message: "로그인 정보 없음" }, { status: 401 })
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
            { message: "관리자 권한이 필요합니다" },
            { status: 403 }
        )
    }

    const body = await request.json();

    if (!body.id || !body.department || !body.position || !body.role) {
        return NextResponse.json(
            { message: "필수 기본정보를 입력해주세요." },
            { status: 400 }
        );
    }

    const targetUser = await prisma.user.findFirst({
        where: {
            id: body.id,
            companyId: admin.companyId,
        },
        select: {
            id: true,
        }
    });

    if (!targetUser) {
        return NextResponse.json(
            { message: "수정할 사원을 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const user = await prisma.user.update({
        where: { id: body.id, },
        data: {
            department: body.department,
            position: body.position,
            role: body.role,
            profile: {
                upsert: {
                    update: {
                        tel: body.tel,
                        statusMsg: body.statusMsg,
                        bestWorker: body.bestWorker,
                    },
                    create: {
                        tel: body.tel ?? "",
                        statusMsg: body.statusMsg ?? "",
                        statusWork: "office",
                        bestWorker: body.bestWorker ?? false,
                    }
                }
            }
        },
        select: {
            id: true,
            name: true,
            department: true,
            position: true,
            role: true,
            profile: {
                select: {
                    tel: true,
                    statusMsg: true,
                    bestWorker: true,
                },
            },
        }
    });

    return NextResponse.json({
        message: "사원 정보가 수정되었습니다.",
        user,
    })

}