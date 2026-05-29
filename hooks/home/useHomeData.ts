import { HomeResponse } from "@/types/home";
import { useEffect, useState } from "react";

export function useHomeData() {
    const [homeData, setHomeData] = useState<HomeResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchHomeData = async () => {

        try {
            setIsLoading(true);
            setErrorMessage("");

            const res = await fetch("/api/home");

            if (!res.ok) {
                setErrorMessage("홈 데이터를 불러오지 못했습니다.");
                return;
            }

            const data: HomeResponse = await res.json();
            setHomeData(data);
        } catch {
            setErrorMessage("네트워크 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHomeData();
    }, []);

    return {
        homeData,
        isLoading,
        errorMessage,
        refetchHome: fetchHomeData,
    };
}