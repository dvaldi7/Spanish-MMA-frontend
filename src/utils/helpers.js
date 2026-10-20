import { getImageUrl, getCloudinarySrcSet } from '../config';

export { getImageUrl, getCloudinarySrcSet };

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