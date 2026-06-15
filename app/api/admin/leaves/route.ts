import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";
import { LeaveStatus, Prisma } from "@prisma/client";
import { calculateAnnualLeave } from "@/utils/leaveUtils";

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;
    const today = new Date();
    const todayText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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

    today.setHours(0, 0, 0, 0);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 7)));
    const status = searchParams.get("status")?.trim();
    const department = searchParams.get("department")?.trim();
    const periodStart = searchParams.get("periodStart")?.trim();
    const periodEnd = searchParams.get("periodEnd")?.trim();

    if (periodStart && periodEnd && periodStart > periodEnd) {
        return NextResponse.json(
            { message: "시작일은 종료일보다 늦을 수 없습니다." },
            { status: 400 }
        );
    }

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

    await prisma.leaveHistory.updateMany({
        where: {
            status: "pending",
            leaveDate: {
                lt: todayText,
            },
            user: {
                companyId: admin.companyId,
            }
        },
        data: {
            status: "rejected",
        }
    })

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

    const departmentOptions = await prisma.department.findMany({
        where: { companyId: admin.companyId },
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        }
    })

    const users = await prisma.user.findMany({
        where: { companyId: admin.companyId },
        select: {
            id: true,
            createdAt: true,
        }
    })

    const allUserHaveLeaveDays = users.reduce((sum, user) => {
        return sum + calculateAnnualLeave(user.createdAt.toISOString());
    }, 0)

    const approvedLeaves = await prisma.leaveHistory.findMany({
        where: {
            status: "approved",
            user: {
                companyId: admin.companyId,
            }
        },
        select: {
            usedDays: true,
            usedHours: true,
        }
    })

    const allUserUseLeaveDays = approvedLeaves.reduce((sum, leave) => {
        return sum + leave.usedDays
    }, 0);

    const remainLeaveDays = allUserHaveLeaveDays - allUserUseLeaveDays;

    const allUserUseLeaveHours = approvedLeaves.reduce((sum, leave) => {
        return sum + leave.usedHours
    }, 0);

    const useRate = allUserHaveLeaveDays === 0
        ? 0
        : (allUserUseLeaveDays / allUserHaveLeaveDays) * 100;

    const remainRate = allUserHaveLeaveDays === 0
        ? 0
        : (remainLeaveDays / allUserHaveLeaveDays) * 100;

    return NextResponse.json({
        leaves,
        departmentOptions,
        summary: {
            totalDays: allUserHaveLeaveDays,
            usedDays: allUserUseLeaveDays,
            remainDays: remainLeaveDays,
            usedHours: allUserUseLeaveHours,
            useRate,
            remainRate,
        },
        page,
        limit,
        leaveTotal,
        totalPages: Math.max(1, Math.ceil(leaveTotal / limit)),
    })
}