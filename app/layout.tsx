import SideBar from "@/components/chat/SideBar"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="flex h-full">
        {/* 여기에 레이아웃 구조 */}
        <SideBar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}