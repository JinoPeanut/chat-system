import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getKoreanDateTime } from "@/utils/dateUtils";

export async function POST() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const { date, minutes: checkInAt } = getKoreanDateTime(new Date());

    if (!date) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            userId,
            date
        },
        select: {
            id: true,
        }
    })

    if (existingAttendance) {
        return NextResponse.json(
            { message: "이미 출근 처리되어 있습니다." },
            { status: 409 }
        )
    }

    const attendance = await prisma.attendance.create({
        data: {
            id: crypto.randomUUID(),
            userId,
            date,
            checkInAt,
            checkOutAt: null,
            workMinutes: null,
        },
        select: {
            id: true,
        }
    });

    return NextResponse.json(attendance, { status: 201 });
}

export async function PATCH() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const { date, minutes: checkOutAt } = getKoreanDateTime(new Date());

    if (!date) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            userId,
            date,
        },
        select: {
            id: true,
            checkInAt: true,
            checkOutAt: true,
        }
    });

    if (!existingAttendance || existingAttendance.checkInAt === null) {
        return NextResponse.json(
            { message: "출근 기록을 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    if (existingAttendance.checkOutAt !== null) {
        return NextResponse.json(
            { message: "이미 퇴근 처리되었습니다." },
            { status: 409 }
        )
    }

    const workMinutes = checkOutAt - existingAttendance.checkInAt;

    const updatedAttendance = await prisma.attendance.update({
        where: {
            id: existingAttendance.id,
        },
        data: {
            checkOutAt,
            workMinutes,
        },
    });

    return NextResponse.json(updatedAttendance);
}
