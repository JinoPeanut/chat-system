import ChatPanel from "./ChatPanel";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-[100dvh] min-h-0 bg-[#F5F2FA]">
            <ChatPanel />

            <div className="min-h-0 flex-1">
                {children}
            </div>
        </div>
    );
}
