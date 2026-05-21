
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./_components/AdminDashboard";

export default async function AdminPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        redirect("/");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
        redirect("/home");
    }

    return (
        <AdminDashboard />
    )
}