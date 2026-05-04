const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const getImageUrl = (photoUrl, defaultImg) => {
    if (!photoUrl) return defaultImg;
    if (photoUrl.startsWith('http') || photoUrl.startsWith('https')) {
        return photoUrl;
    }
    return `${BACKEND_URL}/${photoUrl}`;
};

export const formatDate = (dateString, short = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return short 
            ? date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              });
    } catch {
        return 'Fecha Inválida';
    }
};