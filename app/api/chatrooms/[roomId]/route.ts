import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export async function GET(request: Request,
    { params }: { params: Promise<{ roomId: string }> }) {

    const { roomId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const existingChatRoom = await prisma.chatRoom.findFirst({
        where: {
            id: roomId,
            members: {
                some: {
                    id: userId,
                }
            }
        },
        include: {
            members: true,
            messages: {
                include: {
                    sender: true,
                },
                orderBy: {
                    timeAt: "asc",
                }
            }
        }
    })

    if (!existingChatRoom) {
        return NextResponse.json(
            { message: "접근할 수 없는 채팅방입니다." },
            { status: 404 }
        );
    }

    return NextResponse.json(existingChatRoom);
}