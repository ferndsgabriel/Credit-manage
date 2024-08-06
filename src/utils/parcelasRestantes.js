export default function calcularParcelasRestantes(dataCompra, dataAtual, dataFechamentoCartao, totalParcelas) {
    const dataCompraDate = new Date(dataCompra);
    const dataAtualDate = new Date(dataAtual);
    const dataFechamentoCartaoDate = new Date(dataAtualDate.getFullYear(), dataAtualDate.getMonth(), dataFechamentoCartao);

    let mesesDiferenca = (dataAtualDate.getFullYear() - dataCompraDate.getFullYear()) * 12 + (dataAtualDate.getMonth() - dataCompraDate.getMonth());

    // Ajusta a diferença de meses com base na data de fechamento do cartão
    const dataFechamentoCompraDate = new Date(dataCompraDate.getFullYear(), dataCompraDate.getMonth(), dataFechamentoCartao);
    if (dataCompraDate.getDate() > dataFechamentoCartao) {
        mesesDiferenca--;
    }

    // Ajusta o número de parcelas restantes
    const parcelasRestantes = totalParcelas - mesesDiferenca;
    return parcelasRestantes > 0 ? parcelasRestantes : 0;
}