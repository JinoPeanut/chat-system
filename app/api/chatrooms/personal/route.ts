import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get("auth_user_id")?.value;

    if (!currentUserId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다" },
            { status: 401 }
        );
    }

    const body = await request.json();
    const targetUserId = body.targetUserId;

    if (!targetUserId) {
        return NextResponse.json(
            { message: "상대 유저 정보가 필요합니다" },
            { status: 400 }
        );
    }

    if (currentUserId === targetUserId) {
        return NextResponse.json(
            { message: "자기 자신과 채팅방을 만들 수 없습니다" },
            { status: 400 }
        );
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId }
    })

    if (!targetUser) {
        return NextResponse.json(
            { message: "존재하지 않는 유저입니다" },
            { status: 404 }
        );
    }

    const existingRoom = await prisma.chatRoom.findFirst({
        where: {
            room: "personal",
            AND: [
                { members: { some: { id: currentUserId } } },
                { members: { some: { id: targetUserId } } },
            ]
        },
        include: {
            members: true,
            messages: {
                include: {
                    sender: true,
                },
                orderBy: {
                    timeAt: "asc",
                },
            },
        },
    });

    if (existingRoom) {
        return NextResponse.json(
            { room: existingRoom, isNew: false },
            { status: 200 }
        )
    }

    const newRoom = await prisma.chatRoom.create({
        data: {
            id: crypto.randomUUID(),
            room: "personal",
            members: {
                connect: [
                    { id: currentUserId },
                    { id: targetUserId },
                ],
            },
        },
        include: {
            members: true,
            messages: true,
        },
    });

    return NextResponse.json(
        { room: newRoom, isNew: true },
        { status: 200 }
    );
}