import SideBar from "@/components/chat/SideBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <SideBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
