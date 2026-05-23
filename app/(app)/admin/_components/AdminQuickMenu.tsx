import { ChevronRight, LucideIcon } from "lucide-react"
import Link from "next/link"

type AdminQuickMenuProps = {
    href: string,
    IconClassName: string,
    Icon: LucideIcon,
    title: string,
    description: string,
}

export default function AdminQuickMenu({ href, IconClassName, Icon, title, description }: AdminQuickMenuProps) {
    return (
        <Link href={href}>
            <div className="flex items-center gap-2 bg-white/80 shadow-md px-4 py-6 rounded-xl cursor-pointer hover:-translate-y-1 hover:border-violet-300 transition">
                <div className={`flex items-center justify-center rounded-lg ${IconClassName} p-3`}>
                    <Icon size={30} />
                </div>
                <div className="flex flex-col gap-1">
                    <p className="font-semibold text-">{title}</p>
                    <p className="text-xs text-gray-400 font-semibold tracking-tight">{description}</p>
                </div>
                <ChevronRight size={30} />
            </div>
        </Link>
    )
}