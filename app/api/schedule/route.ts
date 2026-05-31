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

    const schedule = await prisma.schedule.create({
        data: {
            userId,
            title: body.title,
            titleMemo: body.titleMemo ? body.titleMemo : null,
            content: body.content ? body.content : null,
            startAt: new Date(body.startAt),
            endAt: body.endAt ? new Date(body.endAt) : null,
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

    const existingSchedule = await prisma.schedule.findFirst({
        where: {
            id: body.id,
            userId,
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
            id: body.id
        },
        data: {
            title: body.title,
            titleMemo: body.titleMemo ? body.titleMemo : null,
            content: body.content ? body.content : null,
            startAt: new Date(body.startAt),
            endAt: body.endAt ? new Date(body.endAt) : null,
        }
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

    const existingSchedule = await prisma.schedule.findFirst({
        where: {
            id: body.id,
            userId,
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
            id: body.id,
        }
    });

    return NextResponse.json(schedule);
}