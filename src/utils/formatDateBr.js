import addZero from "./addZero";

export default function formatDateBr(date) {
    const newDate = new Date(date);

    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1; // getMonth() retorna um valor de 0 a 11
    const day = newDate.getDate();

    // Formate os valores para dois dígitos
    return `${addZero(day)}/${addZero(month)}/${year}`;
}
