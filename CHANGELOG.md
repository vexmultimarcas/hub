# RC3.0.5 — Contrato Particular Piloto

- Ajuste exclusivo do layout do Contrato Particular.
- Contrato organizado em 4 páginas A4, seguindo a distribuição do modelo oficial da VEX.
- Seções, forma de pagamento, cláusulas e assinaturas reposicionadas para maior fidelidade visual ao DOCX original.
- Nenhuma regra de negócio, campo, Termo de Repasse ou Procuração foi alterado.

# RC3.0.3 — Termo de Repasse Piloto

- Ajuste exclusivo do layout do Termo de Repasse.
- Termo refeito em estrutura visual A4 com cabeçalho, caixas, alinhamentos e assinaturas mais fiéis ao modelo da VEX.
- Nenhuma regra de negócio, campo, pedido sequencial ou fluxo do Document Engine foi alterado.

# RC3.0 — Document Engine

- Aba **Documentos** liberada dentro da Formalização com cartões por documento.
- Documentos iniciais: Contrato Particular, Termo de Repasse e Procuração.
- Validação automática por documento antes de visualizar, baixar ou imprimir.
- Campos novos na Formalização: órgão emissor do RG, UF emissor e tipo do veículo.
- Portas e categoria do veículo mantidas como texto livre, conforme operação da loja.
- Empresa vendedora padronizada como **VEX MULTIMARCAS** com dados oficiais do CNPJ.
- Procuração padronizada com outorgado **GILVAN BATISTA DO NASCIMENTO**.
- Número do pedido sequencial corrigido para iniciar em **1057430** e nunca exibir ID alfanumérico do banco como pedido.
- Geração de DOCX via Document Engine local no navegador.
- Impressão/PDF via tela de impressão do navegador.
- WhatsApp abre conversa do cliente com mensagem pronta.
- Textos jurídicos preservados como templates internos; somente campos variáveis são preenchidos.
- Sem alterações em Login, Dashboard, Firebase, Mobile, Relatórios ou Cadastro de Venda além do número sequencial do pedido.

---

## RC2.08 - Formalização Repasse/Garantia

- Card Repasse/Garantia liberado dentro da Formalização.
- Tipo de venda: com garantia, sem garantia ou repasse.
- Abatimento FIPE calculado automaticamente.
- Gastos/material cadastrados como lista de itens reutilizável.
- Salvamento em `formalization.repasse`.
- Cache PWA atualizado.


## RC2.07 - Formalização Pagamento
- Card Pagamento liberado na Formalização.
- Suporte para múltiplas formas: PIX, financiamento, veículo troca, cartão, crédito em conta, parcelamento loja, dinheiro e outro.
- Conferência automática entre valor do veículo e total informado nas formas de pagamento.
- Campos para transferência cobrada, IPVA e licenciamento com responsável Loja/Cliente/Não se aplica.
- Salvamento em formalization.payment sem alterar o cadastro principal da venda.
- Cache PWA atualizado.

# RC2.06 — Formalização: Dados do Veículo

- Card Veículo liberado dentro da Formalização.
- Formulário para dados do veículo.
- Campos para chassi, renavam, combustível, câmbio, portas e categoria.
- Salvamento em `formalization.vehicle`.
- Progresso automático do card Veículo.
- Venda continua simples, sem alteração no cadastro principal.
- Cache PWA atualizado.

# RC2.03 — Detalhes do Veículo e Formalização Inicial

- Adicionado botão **Editar** para ADM nos detalhes do veículo vendido.
- Edição atualiza a venda existente no Firestore, sem criar venda duplicada.
- Adicionado botão **Formalização** nos detalhes do veículo.
- Criada estrutura inicial da Formalização em checklist/progresso.
- Botão **Excluir** mantido apenas para ADM e separado como ação destrutiva.
- Cadastro de venda original preservado.
- Cache PWA atualizado.

---


## Sprint 11 - Premium Final Quality Layer

- Camada final de qualidade visual e experiência premium.
- Barra contextual com seção atual e status online/offline.
- Progresso visual no cadastro de venda, sem alterar validação ou salvamento.
- Feedback de toque/clique mais nativo em botões e navegação.
- Melhor conforto de teclado com Escape para sair de campos ativos.
- Cache PWA atualizado para Sprint 11.
- Firebase, Authentication, Firestore, initialize() e fluxo principal preservados.


## Sprint 10 - Performance UX + Acabamento Final

- Aplicado content-visibility nas seções para melhorar sensação de performance.
- Adicionado feedback visual mais suave nas transições entre telas.
- Adicionados atalhos de teclado 1-5 para navegação rápida no desktop.
- Adicionado botão discreto para voltar ao topo em telas longas.
- Melhorado foco visual e acessibilidade com focus-visible.
- Ajustado comportamento para safe area em PWA/mobile.
- Cache do Service Worker atualizado para Sprint 10.
- Firebase, Authentication, Firestore, initializeApplication e regras de negócio preservados.

# VEX HUB PRO - CHANGELOG

## v1.0 PREMIUM UI - Sprint 8

### Implementado

- Navegação mobile transformada em bottom bar premium com safe-area.
- Botão flutuante de Nova Venda no mobile.
- Responsividade final para Dashboard, Veículos, Relatórios, Perfil e Usuários.
- Filtros de Veículos otimizados para celular com comportamento sticky.
- Scroll automático para o topo ao trocar de seção.
- Ajustes de toque, leitura e redução de movimento para experiência mais nativa.
- Cache PWA atualizado para nova versão.

### Preservado

- Login e logout.
- Firebase Authentication.
- Firestore.
- Salvamento das vendas.
- Histórico/filtros/drawer.
- Dashboard/cálculos.
- Relatórios/cálculos.
- Controle ADM/Usuário.
- Perfil.
- PWA, manifest e service worker.

## v1.0 PREMIUM UI - Sprint 7

### Implementado

- Logo oficial VEX aplicada no login e na sidebar sem alterar o HTML principal.
- Identidade visual refinada com preto, grafite e vermelho VEX.
- Microinterações de toque/clique mais nativas.
- Manifest PWA atualizado para VEX HUB PRO.
- Service Worker atualizado para cachear logo, ícones e splash.
- Botão de instalação do app preparado quando o navegador disponibilizar o evento PWA.
- Textos institucionais ajustados para VEX Multimarcas.

### Preservado

- Login e logout.
- Firebase Authentication.
- Firestore.
- Salvamento das vendas.
- Histórico/filtros/drawer.
- Dashboard/cálculos.
- Relatórios/cálculos.
- Controle ADM/Usuário.
- Perfil.
- PWA, manifest e service worker.

## v1.0 PREMIUM UI - Sprint 6

### Implementado

- Tela Veículos convertida para lista premium compacta.
- Nome do veículo exibido em uma linha horizontal, usando o máximo da largura disponível.
- Clique na linha do veículo abre o painel lateral com todos os detalhes.
- Layout de Veículos otimizado para desktop e celular.
- Nova Venda refinada visualmente com campos mais limpos e organizados.
- Relatórios refinados com visual executivo.
- Usuários e Perfil refinados visualmente.
- Bottom Navigation preparada para uso mobile.
- Design System premium aplicado por camada incremental, sem alterar a lógica principal.

### Preservado

- Login e logout.
- Firebase Authentication.
- Firestore.
- Salvamento das vendas.
- Histórico/filtros.
- Dashboard/cálculos.
- Relatórios/cálculos.
- Controle ADM/Usuário.
- Perfil.
- Service Worker e Manifest.

### Próximo passo sugerido

- Identidade VEX: logo oficial, ícones PWA, favicon, maskable icon, Apple Touch Icon e splash screen.

## Sprint 9 - Premium Polish UX/UI

- Polimento premium de cards, botões, inputs e listas.
- Feedback visual com toasts leves para navegação e estados de conexão.
- Estados vazios mais refinados, mantendo o HTML e renderizações existentes.
- Micro animações de hover, fade e scale com suporte a redução de movimento.
- Service Worker atualizado para novo cache da Sprint 9.
- Firebase, Authentication, Firestore, initialize() e fluxo de vendas preservados.


## RC2.01 - Mobile seguro

- Mantida a base funcional VEX-HUB(9) como origem.
- Corrigida a centralização mobile do card Bom dia e do card VEX no Dashboard.
- Corrigida a centralização mobile da tela de login e selo do desenvolvedor.
- Menu inferior mobile ajustado para 5 itens: Home, Venda, Veículos, Relatórios e Mais.
- Perfil, Usuários ADM e Sair foram movidos para o menu Mais no Android/iOS.
- Botão Sair adicionado ao fluxo mobile sem alterar o menu desktop.
- Botão flutuante + ocultado no mobile para evitar sobreposição com a navegação inferior.
- Cache PWA atualizado para forçar atualização dos arquivos.
- Sem alterações em Firebase, Auth, Firestore ou fluxo de cadastro de venda.

## RC2.02 - Relatórios

- Filtro padrão Este mês aplicado nos veículos vendidos/relatórios.
- Adicionadas opções Este mês, Mês passado e Todos.
- Dashboard com detalhamento de comissão por Lucas e Frank.
- Cache PWA atualizado.
- Sem alteração no fluxo de venda, Firebase Auth ou regras do Firestore.

## RC2.03 - Detalhes + Formalização inicial

- Adicionado botão Editar para ADM no detalhe do veículo vendido.
- Edição atualiza a venda existente, sem criar uma nova venda.
- Adicionado botão Formalização no detalhe do veículo.
- Criada estrutura inicial da Formalização em checklist.
- Botão Excluir mantido separado como ação destrutiva.
- Cache PWA atualizado.

## RC2.04 - Fundação da Formalização

- Formalização evoluída para painel visual com resumo da venda.
- Adicionado status automático: Formalização em andamento/concluída.
- Adicionada barra de progresso com contagem de etapas concluídas.
- Checklist convertido em cards operacionais: Cliente, Veículo, Pagamento, Repasse/Garantia, Gastos/Material, Transferência, Comunicação e Documentos.
- Nenhum campo novo obrigatório foi criado nesta etapa.
- Venda, login, Firebase Auth, Firestore, Dashboard, Histórico e Relatórios preservados.
- Cache PWA atualizado.

## RC2.05 — Formalização: Dados do Cliente

- Liberado o card Cliente dentro da Formalização.
- Criado formulário para completar dados do comprador e endereço.
- Dados salvos em `formalization.client`, sem alterar o fluxo da venda.
- Progresso do card Cliente calculado automaticamente.
- Regra preservada: endereço real do cliente como padrão; endereço da loja apenas por exceção manual.
- Cache PWA atualizado.

## RC2.09 — Formalização Transferência

- Card Transferência liberado dentro da Formalização.
- Responsável pela transferência: Loja ou Cliente.
- Quando Cliente: procuração marcada como não necessária e controle encerrado.
- Quando Loja: data de reconhecimento, prazo legal de 30 dias, vencimento e status automático.
- Salvamento em `formalization.transfer`.
- Cache PWA atualizado.


## RC2.10 — Formalização Documentos Recebidos

- Card Documentos Recebidos liberado dentro da Formalização.
- Documento de identificação com opções: CNH, RG, CNH + RG ou Pendente.
- Comprovante de endereço com status Recebido/Pendente.
- Comprovantes de pagamento com status Recebido/Pendente.
- Prévia do bloco que será usado no Grupo Vendas.
- Salvamento em `formalization.receivedDocs`.
- Cache PWA atualizado.
