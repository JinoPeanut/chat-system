import { HomeResponse, RefreshOptions } from "@/types/home";
import { useEffect, useState } from "react";

export function useHomeData() {
    const [homeData, setHomeData] = useState<HomeResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchHomeData = async (options?: RefreshOptions) => {

        if (!options?.silent) {
            setIsLoading(true);
        } else {
            setIsRefreshing(true);
        }

        try {
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
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHomeData();
    }, []);

    return {
        homeData,
        isLoading,
        isRefreshing,
        errorMessage,
        refetchHome: fetchHomeData,
    };
}