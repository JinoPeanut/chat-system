import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const users = await prisma.user.findMany();

    const chatRooms = await prisma.chatRoom.findMany({
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

    const notices = await prisma.notice.findMany({
        include: {
            author: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return NextResponse.json({
        users,
        chatRooms,
        notices,
    });
}
