import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

export async function GET() {
    const users = await prisma.user.findMany();

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
