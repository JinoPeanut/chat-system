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

    const profile = await prisma.profile.findUnique({
        where: { userId },
    });

    return NextResponse.json(profile);
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

    if (!body.statusWork) {
        return NextResponse.json(
            { message: "근무 상태를 알 수 없습니다" },
            { status: 400 }
        );
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            profilePic: body.profilePic
        }
    })

    const profile = await prisma.profile.upsert({
        where: { userId },
        update: {
            statusMsg: body.statusMsg,
            statusWork: body.statusWork,
            tel: body.tel,
        },
        create: {
            userId,
            statusMsg: body.statusMsg,
            statusWork: body.statusWork,
            tel: body.tel,
            bestWorker: false,
        },
    });

    return NextResponse.json({
        profile,
        user: {
            id: updatedUser.id,
            profilePic: updatedUser.profilePic,
        }
    });
}
