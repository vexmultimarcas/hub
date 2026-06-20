# VEX HUB PRO — Roadmap Oficial Atualizado

## Direção aprovada

O projeto deve seguir leve, limpo e premium.

As antigas Sprints 03, 04 e 05 foram removidas do roadmap porque trariam módulos desnecessários para este sistema:

- Calendário de entregas.
- CRM completo de clientes.
- Financeiro / pagamento de comissões.
- Exportações financeiras avançadas.

Essas áreas serão tratadas fora do VEX HUB PRO ou não serão implementadas para evitar peso, complexidade e manutenção desnecessária.

---

## Prioridade 1 — Estabilidade

Preservar sempre:

- Login.
- Logout.
- Firebase Authentication.
- Firestore.
- Cadastro de venda.
- Histórico / Veículos.
- Dashboard.
- Relatórios.
- PWA.

---

## Prioridade 2 — Aparência do aplicativo

Evoluir o visual para parecer cada vez mais:

- limpo;
- premium;
- moderno;
- leve;
- parecido com aplicativo nativo;
- alinhado à identidade VEX preto, vermelho, branco e grafite.

---

## Sprint atual — Nome de usuário + Visual Clean

### Objetivo

Adicionar nome de usuário no cadastro e usar esse nome no Dashboard.

Exemplo:

`Bom dia, Junior 👋`

### Implementado

- Campo Nome de usuário na criação de conta.
- Salvamento do nome no Firebase Authentication (`displayName`).
- Tela Perfil para editar o nome depois do login.
- Sidebar exibindo nome + e-mail.
- Visual preto/vermelho/branco mais limpo.

---

## Próxima linha de evolução

Focar em melhorias visuais incrementais e leves, sem criar módulos grandes:

- Refinar espaçamentos.
- Melhorar responsividade mobile.
- Melhorar microinterações.
- Deixar cards mais limpos.
- Melhorar legibilidade dos relatórios.
- Melhorar tela de nova venda sem alterar salvamento.
