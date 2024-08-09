export default function formatDateToYYYYMMDD(date) {
    if (typeof date === 'string') return date; // Se já for string, retorne como está
    if (date instanceof Date) {
        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const dia = String(date.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }
    throw new TypeError('Data deve ser uma instância de Date ou uma string no formato yyyy-mm-dd');
}
