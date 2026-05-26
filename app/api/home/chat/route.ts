import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, },
    });

    if (!currentUser) {
        return NextResponse.json(
            { message: "사용자를 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const chat = await prisma.chatRoom.findMany({
        where: {
            members: {
                some: {
                    id: userId,
                }
            }
        },
        select: {
            id: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    profilePic: true,
                }
            },
            messages: {
                orderBy: {
                    timeAt: "desc",
                },
                take: 1,
                select: {
                    id: true,
                    content: true,
                    timeAt: true,
                }
            },
        }
    })

    return NextResponse.json(chat);
}