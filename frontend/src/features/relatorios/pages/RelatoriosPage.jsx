import { useEffect, useMemo, useState } from "react";
import RelatoriosPainelExportacao from "../components/RelatoriosPainelExportacao";
import RelatoriosResumo from "../components/RelatoriosResumo";
import {
  carregarDadosRelatorios,
  exportarRelatorioCsv,
  exportarRelatorioPdf,
  filtrarTransacoesRelatorio,
  montarRelatorio,
} from "../../../lib/relatorios";

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function RelatoriosPage() {
  const [dados, setDados] = useState(null);
  const [relatorio, setRelatorio] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({
    inicio: `${hojeIso().slice(0, 7)}-01`,
    fim: hojeIso(),
    tipo: "all",
    conta: "all",
    categoria: "all",
    termo: "",
  });

  async function carregarBase() {
    setCarregando(true);
    setErro("");
    try {
      const resultado = await carregarDadosRelatorios();
      setDados(resultado);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarBase();
  }, []);

  const resumoAtual = useMemo(() => {
    if (!relatorio) {
      return { receitas: 0, despesas: 0, saldo: 0, quantidadeTransacoes: 0 };
    }
    return relatorio.resumo;
  }, [relatorio]);

  function atualizarFiltro(campo, valor) {
    setFiltros((atual) => ({ ...atual, [campo]: valor }));
  }

  function gerarRelatorio() {
    if (!dados) return;
    const transacoes = filtrarTransacoesRelatorio(dados.transacoes, filtros);
    const novoRelatorio = montarRelatorio(dados, filtros, transacoes);
    setRelatorio(novoRelatorio);
    setMensagem(`Relatorio gerado com ${novoRelatorio.resumo.quantidadeTransacoes} transacoes.`);
    setErro("");
  }

  function exportarCsv() {
    if (!relatorio) {
      setErro("Gere o relatorio antes de exportar.");
      return;
    }
    exportarRelatorioCsv(relatorio);
  }

  function exportarPdf() {
    if (!relatorio) {
      setErro("Gere o relatorio antes de exportar.");
      return;
    }
    try {
      exportarRelatorioPdf(relatorio);
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <main className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Modulo</p>
      <h1 className="mt-2 text-2xl font-black text-ink">Relatorios</h1>
      <p className="mt-2 text-sm text-slate-600">
        Analise resultados por periodo, categoria, conta e centro de custo.
      </p>

      {erro ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p> : null}
      {mensagem ? <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{mensagem}</p> : null}

      <RelatoriosResumo resumo={resumoAtual} />
      <RelatoriosPainelExportacao
        filtros={filtros}
        contas={dados?.contas || []}
        categorias={dados?.categorias || []}
        carregando={carregando}
        onFiltroChange={atualizarFiltro}
        onGerar={gerarRelatorio}
        onExportarCsv={exportarCsv}
        onExportarPdf={exportarPdf}
        onRecarregarDados={carregarBase}
      />

      {relatorio ? (
        <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-bold text-ink">Resumo integrado do sistema</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Investimentos</p>
              <p className="mt-1 text-sm text-slate-700">
                Patrimonio: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(relatorio.modulos.investimentos.totalAtual)}
              </p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Metas</p>
              <p className="mt-1 text-sm text-slate-700">
                {relatorio.modulos.metas.concluidas}/{relatorio.modulos.metas.total} concluidas
              </p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Recorrencias</p>
              <p className="mt-1 text-sm text-slate-700">
                Saldo mensal: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(relatorio.modulos.recorrencias.saldoMensal)}
              </p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Orcamentos (mes)</p>
              <p className="mt-1 text-sm text-slate-700">
                Limite: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(relatorio.modulos.orcamentos.limiteMes)}
              </p>
            </article>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-[0.08em] text-slate-600">
                <tr>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Conta/Cartao</th>
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2">Descricao</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.transacoes.slice(0, 100).map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{item.occurred_on_iso}</td>
                    <td className="px-3 py-2">{item.tipo_label}</td>
                    <td className="px-3 py-2">{item.conta_nome || item.cartao_nome || "-"}</td>
                    <td className="px-3 py-2">{item.categoria_nome || "-"}</td>
                    <td className="px-3 py-2">{item.description || "-"}</td>
                    <td className="px-3 py-2 text-right">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.amount_num)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
