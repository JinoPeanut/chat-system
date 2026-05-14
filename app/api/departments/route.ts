import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

type DepartmentResponse = {
    id: string;
    name: string;
    members: {
        id: string;
        name: string;
        department: string;
        position: string;
        status: string;
        profilePic: string | null;
    }[];
};

const positionOrder: Record<string, number> = {
    "사원": 1,
    "주임": 2,
    "대리": 3,
    "과장": 4,
    "차장": 5,
    "부장": 6,
};

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);

    const department = searchParams.get("department");
    const position = searchParams.get("position");
    const keyword = searchParams.get("keyword")?.trim();

    const where: Prisma.UserWhereInput = {
        companyId: currentUser.companyId,
    }

    if (department) {
        where.department = department;
    }

    if (position) {
        where.position = position;
    }

    if (keyword) {
        where.OR = [
            { name: { contains: keyword, mode: "insensitive" } },
            { department: { contains: keyword, mode: "insensitive" } },
            { position: { contains: keyword, mode: "insensitive" } },
        ]
    }

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            department: true,
            position: true,
            status: true,
            profilePic: true,
        }
    });

    users.sort((a, b) => {
        if (a.department !== b.department) {
            return a.department.localeCompare(b.department);
        }

        const aPos = positionOrder[a.position] ?? 999;
        const bPos = positionOrder[b.position] ?? 999;

        if (aPos !== bPos) {
            return aPos - bPos;
        }

        return a.name.localeCompare(b.name, "ko");
    });

    const departmentMap = new Map<string, DepartmentResponse>();

    for (const user of users) {
        const deptId = user.department;

        if (!departmentMap.has(deptId)) {
            departmentMap.set(deptId, {
                id: deptId,
                name: deptId,
                members: [],
            });
        }

        departmentMap.get(deptId)?.members.push({
            id: user.id,
            name: user.name,
            department: user.department,
            position: user.position,
            status: user.status,
            profilePic: user.profilePic,
        });
    }

    return NextResponse.json(Array.from(departmentMap.values()));
}
