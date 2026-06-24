import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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

    const pageValue = Number(searchParams.get("page") ?? 1)
    const page = Number.isInteger(pageValue) && pageValue >= 1
        ? pageValue
        : 1;

    const limitValue = Number(searchParams.get("limit") ?? 10);
    const limit = Number.isInteger(limitValue) && limitValue >= 1
        ? Math.min(50, limitValue)
        : 10;

    const periodStart = searchParams.get("periodStart")?.trim();
    const periodEnd = searchParams.get("periodEnd")?.trim();

    const where: Prisma.AdminActivityLogWhereInput = {
        companyId: admin.companyId
    }

    const startDate = periodStart ? new Date(periodStart) : null;
    const endDate = periodEnd ? new Date(periodEnd) : null;

    if (
        (startDate && Number.isNaN(startDate.getTime())) ||
        (endDate && Number.isNaN(endDate.getTime()))
    ) {
        return NextResponse.json(
            { message: "올바른 날짜 형식이 아닙니다." },
            { status: 400 }
        )
    }

    if (startDate && endDate && startDate > endDate) {
        return NextResponse.json(
            { message: "시작일은 종료일보다 늦을 수 없습니다." },
            { status: 400 }
        );
    }

    if (startDate || endDate) {
        where.createdAt = {};

        if (startDate) {
            where.createdAt.gte = startDate;
        }

        if (endDate) {
            endDate.setDate(endDate.getDate() + 1);
            where.createdAt.lt = endDate;
        }
    }

    const [logs, total] = await Promise.all([
        prisma.adminActivityLog.findMany({
            where,
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
            skip: (page - 1) * limit,
        }),

        prisma.adminActivityLog.count({
            where,
        }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
        logs,
        page,
        limit,
        total,
        totalPages,
    });
}