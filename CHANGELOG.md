
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
