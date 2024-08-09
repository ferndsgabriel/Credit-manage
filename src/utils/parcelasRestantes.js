

export default function calcularParcelasRestantes(diaFechamento, dataCompra, totalParcelas) {
    const dataCompraDate = new Date(dataCompra); // TRANFORMO O DIA DA COMPRA EM DATE
    const hoje = new Date(); // TRANFORMO O DIA DE HJ EM DATE

    const diaDeFechamento = new Date(); // CRIANDO O DIA DE FECHAMENTO

    diaDeFechamento.setFullYear(dataCompraDate.getFullYear()); //ESTOU QUE PARA AQUELA COMPRA O ANO DE FECHAMENTO VAI SER IGUAL O ANO DA COMPRA
    diaDeFechamento.setMonth(dataCompraDate.getMonth())//ESTOU QUE PARA AQUELA COMPRA O MES DE FECHAMENTO VAI SER IGUAL O MES DA COMPRA
    diaDeFechamento.setDate(diaFechamento)//ESTOU QUE PARA AQUELA COMPRA O MES DE FECHAMENTO VAI SER IGUAL O MES DA COMPRA

    // compra dia 10/05/2024
    //data de fechamento 09/05/2024
    let setDay = 0;
    if (dataCompraDate > diaDeFechamento){
      setDay = 1
    }

    const anosPassados = hoje.getFullYear() - dataCompraDate.getFullYear();
    const mesesPassados = hoje.getMonth() - dataCompraDate.getMonth() + (anosPassados * 12);
    
    const parcelasPassadas = (mesesPassados -  setDay );

    const parcelasRestantes = totalParcelas - parcelasPassadas;

    return parcelasRestantes;


}
