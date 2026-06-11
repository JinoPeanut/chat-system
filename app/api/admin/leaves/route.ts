import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { LeaveStatus, Prisma } from "@prisma/client";

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
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 7)));
    const status = searchParams.get("status")?.trim();
    const department = searchParams.get("department")?.trim();
    const periodStart = searchParams.get("periodStart")?.trim();
    const periodEnd = searchParams.get("periodEnd")?.trim();

    const userWhere: Prisma.UserWhereInput = {
        companyId: admin.companyId
    }

    const where: Prisma.LeaveHistoryWhereInput = {
        user: userWhere,
    };

    const isLeaveStatus = (value: string): value is LeaveStatus => {
        return Object.values(LeaveStatus).includes(value as LeaveStatus);
    }

    if (status) {
        if (!isLeaveStatus(status)) {
            return NextResponse.json(
                { message: "올바르지 않은 연차 상태 입니다." },
                { status: 400 }
            )
        }

        where.status = status;
    }

    if (department) {
        userWhere.department = department;
    }

    if (periodStart || periodEnd) {
        where.createdAt = {};

        if (periodStart) {
            where.createdAt.gte = new Date(periodStart);
        }

        if (periodEnd) {
            const endDate = new Date(periodEnd);
            endDate.setDate(endDate.getDate() + 1);

            where.createdAt.lt = endDate;
        }
    }

    const leaveTotal = await prisma.leaveHistory.count({
        where,
    })

    const leaves = await prisma.leaveHistory.findMany({
        where,
        select: {
            id: true,
            userId: true,
            createdAt: true,
            leaveDate: true,
            leaveType: true,
            usedDays: true,
            usedHours: true,
            status: true,
            reason: true,
            user: {
                select: {
                    name: true,
                    department: true,
                    position: true,
                    profilePic: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,

    })

    return NextResponse.json({
        leaves,
        page,
        limit,
        leaveTotal,
        totalPages: Math.max(1, Math.ceil(leaveTotal / limit)),
    })
}