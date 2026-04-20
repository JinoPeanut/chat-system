import { Briefcase, Settings } from "lucide-react";

export default function ProfileCard() {
    return (
        <div className="
                border border-gray-200 rounded-md
                shadow-lg min-h-[45%] pb-2
            ">
            {/* 설정 */}
            <div className="
                flex justify-end bg-purple-300 px-2 py-4"
            >
                <Settings size={18} className="cursor-pointer hover:text-gray-200" />
            </div>

            <div className="px-2">
                {/* 프로필 영역 */}
                <div className="flex flex-col items-center mt-2">
                    <img alt="사진" className="w-[6rem] h-[6rem] bg-gray-400 rounded-full" />
                    <div className="flex gap-1 font-bold">
                        <p>이름</p>
                        <p>직급</p>
                    </div>
                    <p className="text-sm text-gray-400">부서</p>
                </div>

                {/* 경계선 */}
                <div className="border-gray-200 border-[0.2] mx-2"></div>

                {/* 상태 메세지 */}
                <div className="py-2 flex flex-col justify-center items-center">
                    <p>현재 상태 메세지</p>
                    <div className="flex items-center">
                        <Briefcase size={15} />
                        <span>근무 형태 (재택 근무)</span>
                    </div>
                </div>

                {/* 이달의 우수사원 이모지 */}
                <div className="flex justify-center pb-2">
                    {"🏆"}
                </div>

                {/* 경계선 */}
                <div className="border-gray-200 border-[0.2] mx-2"></div>

                {/* 기타 정보 */}
                <div className="grid grid-cols-2 py-2">
                    <div >
                        <p>회사</p>
                        <p>부서</p>
                        <p>직급</p>
                        <p>휴대폰 번호</p>

                    </div>
                    <div>
                        <p>땅콩 그룹</p>
                        <p>개발팀</p>
                        <p>사원</p>
                        {"010-1234-5678"}
                    </div>
                </div>
            </div>
        </div>
    )
}