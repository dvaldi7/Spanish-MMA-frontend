//Ventana de paginación: primera/última página, ±windowSize alrededor de la actual y '…' en los huecos
export const buildPageWindow = (currentPage, totalPages, windowSize = 2) => {
    if (!Number.isInteger(currentPage) || !Number.isInteger(totalPages) || totalPages < 1) {
        return [];
    }
    if (totalPages === 1) return [1];

    const safeCurrent = Math.min(Math.max(1, currentPage), totalPages);
    const pages = new Set([1, totalPages]);

    for (let page = safeCurrent - windowSize; page <= safeCurrent + windowSize; page++) {
        if (page >= 1 && page <= totalPages) pages.add(page);
    }

    return [...pages]
        .sort((a, b) => a - b)
        .reduce((acc, page, index, arr) => {
            if (index > 0 && page - arr[index - 1] > 1) acc.push('…');
            acc.push(page);
            return acc;
        }, []);
};
