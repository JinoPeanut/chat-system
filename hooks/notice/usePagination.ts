import { useState } from "react";

type usePaginationParams = {
    totalPages: number,
}

export function usePagination({ totalPages }: usePaginationParams) {
    const [page, setPage] = useState(1);

    const nextPage = () => {
        setPage(prev => Math.min(prev + 1, totalPages));
    };

    const prevPage = () => {
        setPage(prev => Math.max(prev - 1, 1));
    };

    return {
        page,
        setPage,
        totalPages,
        nextPage,
        prevPage,
    }
}