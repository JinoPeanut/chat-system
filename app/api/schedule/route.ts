import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    const { title, startAt, endAt, titleMemo, content } = body;

    if (typeof title !== "string" || !title.trim() || typeof startAt !== "string") {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    if (endAt !== undefined && typeof endAt !== "string") {
        return NextResponse.json(
            { message: "종료일 형식이 올바르지 않습니다." },
            { status: 400 }
        )
    }

    if (titleMemo !== undefined && typeof titleMemo !== "string") {
        return NextResponse.json(
            { message: "메모 형식이 올바르지 않습니다." },
            { status: 400 }
        );
    }

    if (content !== undefined && typeof content !== "string") {
        return NextResponse.json(
            { message: "내용 형식이 올바르지 않습니다." },
            { status: 400 }
        )
    }

    const startDate = new Date(startAt);
    const endDate = endAt ? new Date(endAt) : null;

    if (Number.isNaN(startDate.getTime()) || (endDate && Number.isNaN(endDate.getTime()))) {
        return NextResponse.json(
            { message: "올바른 날짜 형식이 아닙니다." },
            { status: 400 }
        )
    }

    if (endDate && endDate.getTime() < startDate.getTime()) {
        return NextResponse.json(
            { message: "종료일은 시작일보다 빠를 수 없습니다." },
            { status: 400 }
        );
    }

    const schedule = await prisma.schedule.create({
        data: {
            userId,
            title: title.trim(),
            titleMemo: titleMemo ? titleMemo : null,
            content: content ? content : null,
            startAt: startDate,
            endAt: endDate,
        }
    });

    return NextResponse.json(schedule);
}

export async function PATCH(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const body = await request.json();

    const { id, title, startAt, endAt, titleMemo, content } = body;

    if (typeof id !== "string" || !id.trim()) {
        return NextResponse.json(
            { message: "일정 id가 필요합니다." },
            { status: 400 }
        );
    }

    if (typeof title !== "string" || !title.trim() || typeof startAt !== "string") {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    if (endAt !== undefined && typeof endAt !== "string") {
        return NextResponse.json(
            { message: "종료일 형식이 올바르지 않습니다." },
            { status: 400 }
        )
    }

    if (titleMemo !== undefined && typeof titleMemo !== "string") {
        return NextResponse.json(
            { message: "메모 형식이 올바르지 않습니다." },
            { status: 400 }
        );
    }

    if (content !== undefined && typeof content !== "string") {
        return NextResponse.json(
            { message: "내용 형식이 올바르지 않습니다." },
            { status: 400 }
        )
    }

    const startDate = new Date(startAt);
    const endDate = endAt ? new Date(endAt) : null;

    if (Number.isNaN(startDate.getTime()) || (endDate && Number.isNaN(endDate.getTime()))) {
        return NextResponse.json(
            { message: "올바른 날짜 형식이 아닙니다." },
            { status: 400 }
        )
    }

    if (endDate && endDate.getTime() < startDate.getTime()) {
        return NextResponse.json(
            { message: "종료일은 시작일보다 빠를 수 없습니다." },
            { status: 400 }
        );
    }

    const existingSchedule = await prisma.schedule.findFirst({
        where: {
            id: id,
            userId,
        },
        select: {
            id: true,
        }
    })

    if (!existingSchedule) {
        return NextResponse.json(
            { message: "수정할 수 없는 일정입니다" },
            { status: 404 }
        );
    }

    const schedule = await prisma.schedule.update({
        where: {
            id: id,
        },
        data: {
            title: title.trim(),
            titleMemo: titleMemo ? titleMemo : null,
            content: content ? content : null,
            startAt: startDate,
            endAt: endDate,
        },
    })

    return NextResponse.json(schedule);
}

export async function DELETE(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const body = await request.json();

    const { id } = body;

    if (typeof id !== "string" || !id.trim()) {
        return NextResponse.json(
            { message: "일정 id가 필요합니다." },
            { status: 400 }
        );
    }

    const existingSchedule = await prisma.schedule.findFirst({
        where: {
            id: id,
            userId,
        },
        select: {
            id: true,
        }
    })

    if (!existingSchedule) {
        return NextResponse.json(
            { message: "삭제할 수 없는 일정입니다" },
            { status: 404 }
        );
    }

    const schedule = await prisma.schedule.delete({
        where: {
            id: id,
        }
    });

    return NextResponse.json(schedule);
}