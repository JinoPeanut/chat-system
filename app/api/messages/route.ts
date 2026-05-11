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
    const { chatRoomId, content } = body;

    const existingchatRoom = await prisma.chatRoom.findFirst({
        where: {
            id: chatRoomId,
            members: {
                some: {
                    id: userId,
                }
            }
        }
    })

    if (!existingchatRoom) {
        return NextResponse.json(
            { message: "메세지를 보낼 수 없는 채팅방 입니다." },
            { status: 404 }
        );
    }

    if (!chatRoomId || !content?.trim()) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    const message = await prisma.message.create({
        data: {
            id: crypto.randomUUID(),
            senderId: userId,
            chatRoomId,
            content: content.trim(),
        },
    });

    return NextResponse.json(message, { status: 201 });
}
