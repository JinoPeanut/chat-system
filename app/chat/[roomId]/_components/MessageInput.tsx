import { Plus, Smile } from "lucide-react"

export default function MessageInput() {
    return (
        <div className="
            m-2 border-gray-400/50 border bg-gray-600
            h-[60px] rounded-md px-3
        ">
            <div className="h-full flex items-center gap-2">
                {/* 업로드 버튼 or 그 외 기능 */}
                <button type="button" className="shrink-0 p-1 rounded-md hover:bg-gray-500 group">
                    <Plus size={30} className="text-gray-700/70 group-hover:text-gray-400" />
                </button>

                <div className="flex items-center gap-2 w-full">
                    {/* 채팅입력칸 */}
                    <input
                        type="text"
                        placeholder={`님께 메세지 보내기`}
                        className="
                            w-full bg-transparent outline-none text-white 
                            placeholder:text-gray-300 flex-1 min-w-0"
                    />

                    {/* 이모지 버튼 */}
                    <button type="button" className="shrink-0 p-1 rounded-md hover:bg-gray-500 group">
                        <Smile size={30} className="text-gray-700/70 group-hover:text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    )
}