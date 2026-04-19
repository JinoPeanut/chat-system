import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();
    const { senderId, chatRoomId, content } = body;

    if (!senderId || !chatRoomId || !content?.trim()) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    const message = await prisma.message.create({
        data: {
            id: crypto.randomUUID(),
            senderId,
            chatRoomId,
            content: content.trim(),
        },
    });

    return NextResponse.json(message, { status: 201 });
}
