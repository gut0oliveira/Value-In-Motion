import { useState } from "react";
import ConfirmDialog from "../features/common/components/ConfirmDialog";

export default function useConfirmDialog() {
  const [estado, setEstado] = useState({
    aberto: false,
    titulo: "Confirmar acao",
    mensagem: "Deseja continuar?",
    textoConfirmar: "Confirmar",
    textoCancelar: "Cancelar",
  });
  const [resolver, setResolver] = useState(null);

  function confirmar(opcoes = {}) {
    return new Promise((resolve) => {
      setEstado({
        aberto: true,
        titulo: opcoes.titulo || "Confirmar acao",
        mensagem: opcoes.mensagem || "Deseja continuar?",
        textoConfirmar: opcoes.textoConfirmar || "Confirmar",
        textoCancelar: opcoes.textoCancelar || "Cancelar",
      });
      setResolver(() => resolve);
    });
  }

  function fechar(resultado) {
    if (resolver) resolver(resultado);
    setResolver(null);
    setEstado((atual) => ({ ...atual, aberto: false }));
  }

  const dialogo = (
    <ConfirmDialog
      aberto={estado.aberto}
      titulo={estado.titulo}
      mensagem={estado.mensagem}
      textoConfirmar={estado.textoConfirmar}
      textoCancelar={estado.textoCancelar}
      onConfirmar={() => fechar(true)}
      onCancelar={() => fechar(false)}
    />
  );

  return { confirmar, dialogo };
}

