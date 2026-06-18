import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { NoticeCategory, Prisma } from "@prisma/client";

export async function GET(request: Request) {
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
            company: {
                select: {
                    name: true,
                }
            }
        }
    })

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

    const limitValue = Number(searchParams.get("limit") ?? 7);
    const limit = Number.isInteger(limitValue) && limitValue >= 1
        ? Math.min(50, limitValue)
        : 7;

    const category = searchParams.get("category")?.trim();
    const periodStart = searchParams.get("periodStart")?.trim();
    const periodEnd = searchParams.get("periodEnd")?.trim();
    const keyword = searchParams.get("keyword")?.trim();

    if (periodStart && periodEnd && periodStart > periodEnd) {
        return NextResponse.json(
            { message: "시작일은 종료일보다 늦을 수 없습니다." },
            { status: 400 }
        );
    }

    const userWhere: Prisma.UserWhereInput = {
        companyId: admin.companyId,
    }

    const where: Prisma.NoticeWhereInput = {
        author: userWhere,
    }

    const isNoticeCategory = (value: string): value is NoticeCategory => {
        return Object.values(NoticeCategory).includes(value as NoticeCategory);
    }

    if (category) {
        if (!isNoticeCategory(category)) {
            return NextResponse.json(
                { message: "올바르지 않은 카테고리 선택입니다." },
                { status: 400 }
            )
        }

        where.category = category;
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

    if (startDate || endDate) {
        where.createdAt = {};

        if (startDate) {
            where.createdAt.gte = new Date(startDate);
        }

        if (endDate) {
            endDate.setDate(endDate.getDate() + 1);
            where.createdAt.lt = endDate;
        }
    }

    if (keyword) {
        where.OR = [
            { title: { contains: keyword, mode: "insensitive" } },
            { author: { name: { contains: keyword, mode: "insensitive" } } },
        ]
    }

    const total = await prisma.notice.count({
        where,
    })

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const notices = await prisma.notice.findMany({
        where,
        select: {
            id: true,
            title: true,
            category: true,
            isPinned: true,
            createdAt: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    profilePic: true,
                }
            }
        },
        orderBy: {
            isPinned: "desc",
            createdAt: "desc"
        },
        skip: (page - 1) * limit,
        take: limit,
    });

    return NextResponse.json({
        notices,
        total,
        page,
        limit,
        totalPages,
    })
}