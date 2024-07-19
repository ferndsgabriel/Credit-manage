export default function FormatName(name){
    const nameLower = name.toLowerCase();
    const getFirstLetter = nameLower.substring(0, 1).toUpperCase();
    const nameRest = nameLower.substring(1);
    return `${getFirstLetter}${nameRest}`;
}
