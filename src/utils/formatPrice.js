export default function formatPrice  (price)  {
    const numericPrice = parseFloat(price);
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
};