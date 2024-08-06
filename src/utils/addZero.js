export default function addZero(value){
    const getToNumber = parseInt(value);
    return getToNumber < 10 ? `0${getToNumber}` : value;
}