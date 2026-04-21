import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const profile = await prisma.profile.findMany({
        include: {
            profileUser: true,
        }
    });

    return NextResponse.json(profile);
}