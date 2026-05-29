import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateAnnualLeave } from "@/utils/leaveUtils";

export async function PATCH(request: Request) {
    const body = await request.json();
    const { leaveId } = body;

    if (!leaveId) {
        return NextResponse.json(
            { message: "leaveId가 필요합니다." },
            { status: 400 }
        );
    }

    const leave = await prisma.leaveHistory.findUnique({
        where: { id: leaveId },
    });

    if (!leave) {
        return NextResponse.json(
            { message: "존재하지 않는 휴가 신청입니다." },
            { status: 404 }
        );
    }

    if (leave.status === "approved") {
        return NextResponse.json(
            { message: "이미 승인된 휴가입니다." },
            { status: 400 }
        );
    }

    if (leave.status === "rejected") {
        return NextResponse.json(
            { message: "반려된 휴가는 승인할 수 없습니다." },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: leave.userId },
        select: {
            id: true,
            createdAt: true,
        },
    });

    if (!user) {
        return NextResponse.json(
            { message: "유저를 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const totalDays = calculateAnnualLeave(user.createdAt.toISOString());

    const result = await prisma.$transaction(async (tx) => {
        const balance = await tx.leaveBalance.upsert({
            where: { userId: leave.userId },
            update: {
                totalDays,
                usedDays: {
                    increment: leave.usedDays,
                },
                useHours: {
                    increment: leave.usedHours,
                },
            },
            create: {
                id: crypto.randomUUID(),
                userId: leave.userId,
                totalDays,
                usedDays: leave.usedDays,
                useHours: leave.usedHours,
            },
        });

        const approvedLeave = await tx.leaveHistory.update({
            where: { id: leave.id },
            data: {
                status: "approved",
            },
        });

        return {
            leave: approvedLeave,
            balance,
        };
    });

    return NextResponse.json(result, { status: 200 });
}
