import { addMonths, isBefore, endOfMonth, startOfMonth, isSameMonth, isSameDay } from 'date-fns';

export default function calcularParcelasRestantes(diaFechamento, dataCompra, totalParcelas, dataAtual = new Date()) {
  // Validação dos parâmetros
  console.log("data real da compra "+dataCompra)
  if (typeof dataCompra !== 'string' || typeof diaFechamento !== 'number' || typeof totalParcelas !== 'number') {
    throw new TypeError('Parâmetros inválidos. dataCompra deve ser uma string, diaFechamento e totalParcelas devem ser números.');
  }

  // Converte a dataCompra para um objeto Date
  const dataCompraDate = new Date(dataCompra);
  const dataAtualDate = dataAtual;

  // Garante que o dia de fechamento seja válido para o mês
  const ultimoDiaDoMes = endOfMonth(startOfMonth(dataCompraDate)).getDate();
  diaFechamento = Math.min(diaFechamento, ultimoDiaDoMes);

  console.log('Data da Compra:', dataCompraDate);
  console.log('Data Atual:', dataAtualDate);

  // Inicializa a data de fechamento da primeira parcela
  let dataFechamentoParcela = new Date(dataCompraDate.getFullYear(), dataCompraDate.getMonth(), diaFechamento);

  // Ajusta a data de fechamento para o próximo mês se a compra foi feita após o fechamento
  if (isBefore(dataCompraDate, dataFechamentoParcela)) {
    dataFechamentoParcela = addMonths(dataFechamentoParcela, -1);
  }

  console.log('Data de Fechamento da Primeira Parcela:', dataFechamentoParcela);

  // Conta as parcelas pagas até a data atual
  let parcelasPagas = 0;
  let dataFechamentoAtual = new Date(dataFechamentoParcela);

  while (isBefore(dataFechamentoAtual, dataAtualDate)) {
    console.log('Verificando Data de Fechamento Atual:', dataFechamentoAtual);
    parcelasPagas++;
    dataFechamentoAtual = addMonths(dataFechamentoAtual, 1);
  }

  // Ajusta o cálculo para compras antes do fechamento do mês
  if (dataCompraDate.getDate() <= diaFechamento) {
    parcelasPagas--;
  }

  console.log('Parcelas Pagas:', parcelasPagas);

  // Calcula as parcelas restantes
  const parcelasRestantes = totalParcelas - parcelasPagas;
  console.log('Parcelas Restantes:', parcelasRestantes);
  return Math.max(parcelasRestantes, 0);
}
