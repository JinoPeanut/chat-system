import { prisma } from "@/lib/prisma";
import { LeaveType } from "@/types/leave";
import { getUsageByLeaveType } from "@/utils/leaveUtils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const LEAVE_TYPES = ["annual", "half_am", "half_pm"] as const;

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const body = await request.json();

    if (!body.leaveDate || !body.leaveType) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    if (!LEAVE_TYPES.includes(body.leaveType)) {
        return NextResponse.json(
            { message: "올바르지 않은 휴가 유형입니다." },
            { status: 400 },
        )
    }

    const { usedDays, usedHours } = getUsageByLeaveType(body.leaveType as LeaveType);

    const leave = await prisma.leaveHistory.create({
        data: {
            id: crypto.randomUUID(),
            userId,
            leaveDate: body.leaveDate,
            leaveType: body.leaveType,
            usedDays,
            usedHours,
            status: "pending",
            reason: body.reason,
        },
    });

    return NextResponse.json(leave, { status: 201 });
}
