import {
  buscarInvestimentos,
  buscarCartoes,
  buscarCategorias,
  buscarContas,
  buscarMetas,
  buscarOrcamentos,
  buscarRecorrencias,
  buscarTransacoes,
} from "./api";

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function normalizarData(dataIso) {
  if (!dataIso || typeof dataIso !== "string") return "";
  return dataIso.slice(0, 10);
}

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

function paraMensalRecorrencia(item) {
  const valor = numero(item.amount);
  if (item.frequency === "weekly") return valor * 4.33;
  if (item.frequency === "yearly") return valor / 12;
  return valor;
}

function csvEscape(valor) {
  const texto = String(valor ?? "");
  if (!texto.includes(";") && !texto.includes('"') && !texto.includes("\n")) return texto;
  return `"${texto.replace(/"/g, '""')}"`;
}

function normalizarInvestimento(item) {
  return {
    ...item,
    valorInvestido: numero(item.valorInvestido ?? item.invested_amount),
    valorAtual: numero(item.valorAtual ?? item.current_amount),
  };
}

export async function carregarDadosRelatorios() {
  const [contas, categorias, cartoes, transacoesApi, investimentosApi, metas, recorrencias, orcamentos] = await Promise.all([
    buscarContas(),
    buscarCategorias(),
    buscarCartoes(),
    buscarTransacoes(),
    buscarInvestimentos(),
    buscarMetas(),
    buscarRecorrencias(),
    buscarOrcamentos(),
  ]);

  const nomeContaPorId = Object.fromEntries(contas.map((item) => [String(item.id), item.name]));
  const nomeCategoriaPorId = Object.fromEntries(categorias.map((item) => [String(item.id), item.name]));
  const nomeCartaoPorId = Object.fromEntries(cartoes.map((item) => [String(item.id), item.name]));

  const transacoes = transacoesApi.map((item) => {
    const contaNome = item.account ? nomeContaPorId[String(item.account)] || `Conta #${item.account}` : "";
    const cartaoNome = item.credit_card
      ? nomeCartaoPorId[String(item.credit_card)] || `Cartao #${item.credit_card}`
      : "";
    const categoriaNome = item.category
      ? nomeCategoriaPorId[String(item.category)] || `Categoria #${item.category}`
      : "";

    return {
      ...item,
      amount_num: numero(item.amount),
      occurred_on_iso: normalizarData(item.occurred_on),
      conta_nome: contaNome,
      cartao_nome: cartaoNome,
      categoria_nome: categoriaNome,
      origem_label: item.credit_card ? "Cartao" : "Conta",
      tipo_label: item.transaction_type === "income" ? "Receita" : "Despesa",
    };
  });

  return {
    contas,
    categorias,
    cartoes,
    transacoes,
    investimentos: investimentosApi.map(normalizarInvestimento),
    metas,
    recorrencias,
    orcamentos,
  };
}

export function filtrarTransacoesRelatorio(transacoes, filtros) {
  const inicio = filtros.inicio || "";
  const fim = filtros.fim || "";
  const conta = filtros.conta || "all";
  const categoria = filtros.categoria || "all";
  const tipo = filtros.tipo || "all";
  const termo = (filtros.termo || "").trim().toLowerCase();

  return transacoes.filter((item) => {
    if (inicio && item.occurred_on_iso < inicio) return false;
    if (fim && item.occurred_on_iso > fim) return false;
    if (conta !== "all" && String(item.account) !== String(conta)) return false;
    if (categoria !== "all" && String(item.category) !== String(categoria)) return false;
    if (tipo !== "all" && item.transaction_type !== tipo) return false;
    if (termo && !(item.description || "").toLowerCase().includes(termo)) return false;
    return true;
  });
}

export function montarRelatorio(dados, filtros, transacoesFiltradas) {
  const receitas = transacoesFiltradas
    .filter((item) => item.transaction_type === "income")
    .reduce((soma, item) => soma + item.amount_num, 0);
  const despesas = transacoesFiltradas
    .filter((item) => item.transaction_type === "expense")
    .reduce((soma, item) => soma + item.amount_num, 0);
  const saldo = receitas - despesas;

  const investimentosResumo = dados.investimentos.reduce(
    (acc, item) => {
      acc.totalInvestido += numero(item.valorInvestido);
      acc.totalAtual += numero(item.valorAtual);
      return acc;
    },
    { totalInvestido: 0, totalAtual: 0 }
  );
  investimentosResumo.retorno = investimentosResumo.totalAtual - investimentosResumo.totalInvestido;

  const metasAtivas = dados.metas.filter((item) => item.active);
  const metasResumo = {
    total: dados.metas.length,
    ativas: metasAtivas.length,
    concluidas: dados.metas.filter((item) => numero(item.current_amount) >= numero(item.target_amount)).length,
    faltante: dados.metas.reduce(
      (soma, item) => soma + Math.max(0, numero(item.target_amount) - numero(item.current_amount)),
      0
    ),
  };

  const recorrenciasAtivas = dados.recorrencias.filter((item) => item.active);
  const recorrenciasResumo = {
    totalAtivas: recorrenciasAtivas.length,
    receitasMensais: recorrenciasAtivas
      .filter((item) => item.transaction_type === "income")
      .reduce((soma, item) => soma + paraMensalRecorrencia(item), 0),
    despesasMensais: recorrenciasAtivas
      .filter((item) => item.transaction_type === "expense")
      .reduce((soma, item) => soma + paraMensalRecorrencia(item), 0),
  };
  recorrenciasResumo.saldoMensal = recorrenciasResumo.receitasMensais - recorrenciasResumo.despesasMensais;

  const mesAtual = hojeIso().slice(0, 7);
  const orcamentosMes = dados.orcamentos.filter((item) => item.month_ref === mesAtual && item.active);
  const orcamentosResumo = {
    totalAtivosMes: orcamentosMes.length,
    limiteMes: orcamentosMes.reduce((soma, item) => soma + numero(item.limit_amount), 0),
  };

  return {
    geradoEm: new Date().toISOString(),
    filtrosAplicados: { ...filtros },
    resumo: {
      quantidadeTransacoes: transacoesFiltradas.length,
      receitas,
      despesas,
      saldo,
    },
    modulos: {
      investimentos: investimentosResumo,
      metas: metasResumo,
      recorrencias: recorrenciasResumo,
      orcamentos: orcamentosResumo,
    },
    transacoes: transacoesFiltradas,
  };
}

export function exportarRelatorioCsv(relatorio) {
  const linhas = [];
  linhas.push("Relatorio Financeiro Value in Motion");
  linhas.push(`Gerado em;${new Date(relatorio.geradoEm).toLocaleString("pt-BR")}`);
  linhas.push("");
  linhas.push("Resumo");
  linhas.push(`Receitas;${relatorio.resumo.receitas.toFixed(2)}`);
  linhas.push(`Despesas;${relatorio.resumo.despesas.toFixed(2)}`);
  linhas.push(`Saldo;${relatorio.resumo.saldo.toFixed(2)}`);
  linhas.push(`Quantidade de transacoes;${relatorio.resumo.quantidadeTransacoes}`);
  linhas.push("");
  linhas.push("Modulos");
  linhas.push(`Investido total;${relatorio.modulos.investimentos.totalInvestido.toFixed(2)}`);
  linhas.push(`Patrimonio atual;${relatorio.modulos.investimentos.totalAtual.toFixed(2)}`);
  linhas.push(`Retorno investimentos;${relatorio.modulos.investimentos.retorno.toFixed(2)}`);
  linhas.push(`Metas totais;${relatorio.modulos.metas.total}`);
  linhas.push(`Metas concluidas;${relatorio.modulos.metas.concluidas}`);
  linhas.push(`Faltante metas;${relatorio.modulos.metas.faltante.toFixed(2)}`);
  linhas.push(`Recorrencias ativas;${relatorio.modulos.recorrencias.totalAtivas}`);
  linhas.push(`Saldo mensal recorrencias;${relatorio.modulos.recorrencias.saldoMensal.toFixed(2)}`);
  linhas.push(`Orcamentos ativos no mes;${relatorio.modulos.orcamentos.totalAtivosMes}`);
  linhas.push(`Limite total orcamentos no mes;${relatorio.modulos.orcamentos.limiteMes.toFixed(2)}`);
  linhas.push("");
  linhas.push("Transacoes");
  linhas.push("Data;Tipo;Origem;Conta;Cartao;Categoria;Descricao;Valor");
  relatorio.transacoes.forEach((item) => {
    linhas.push(
      [
        csvEscape(item.occurred_on_iso),
        csvEscape(item.tipo_label),
        csvEscape(item.origem_label),
        csvEscape(item.conta_nome),
        csvEscape(item.cartao_nome),
        csvEscape(item.categoria_nome),
        csvEscape(item.description || ""),
        csvEscape(item.amount_num.toFixed(2)),
      ].join(";")
    );
  });

  const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dataRef = hojeIso();
  link.href = url;
  link.download = `relatorio-financeiro-${dataRef}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportarRelatorioPdf(relatorio) {
  const janela = window.open("", "_blank", "noopener,noreferrer,width=1000,height=800");
  if (!janela) {
    throw new Error("Nao foi possivel abrir a janela de impressao. Verifique o bloqueador de popup.");
  }

  const linhasTabela = relatorio.transacoes
    .map(
      (item) => `
      <tr>
        <td>${item.occurred_on_iso}</td>
        <td>${item.tipo_label}</td>
        <td>${item.origem_label}</td>
        <td>${item.conta_nome || "-"}</td>
        <td>${item.categoria_nome || "-"}</td>
        <td>${item.description || "-"}</td>
        <td style="text-align:right">${formatoMoeda.format(item.amount_num)}</td>
      </tr>
    `
    )
    .join("");

  janela.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Relatorio Financeiro</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin: 0 0 4px; }
          p { margin: 0 0 12px; font-size: 12px; color: #475569; }
          .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
          .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; }
          th { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h1>Relatorio Financeiro</h1>
        <p>Gerado em ${new Date(relatorio.geradoEm).toLocaleString("pt-BR")}</p>
        <div class="grid">
          <div class="card"><strong>Receitas</strong><br />${formatoMoeda.format(relatorio.resumo.receitas)}</div>
          <div class="card"><strong>Despesas</strong><br />${formatoMoeda.format(relatorio.resumo.despesas)}</div>
          <div class="card"><strong>Saldo</strong><br />${formatoMoeda.format(relatorio.resumo.saldo)}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Data</th><th>Tipo</th><th>Origem</th><th>Conta</th><th>Categoria</th><th>Descricao</th><th>Valor</th>
            </tr>
          </thead>
          <tbody>${linhasTabela}</tbody>
        </table>
      </body>
    </html>
  `);
  janela.document.close();
  janela.focus();
  janela.print();
}
