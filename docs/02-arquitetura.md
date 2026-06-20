# VEX HUB

## Arquitetura Oficial

Versão: 0.1 Alpha

---

# Objetivo

Sistema PWA desenvolvido para controle de vendas, geração de relatórios e cálculo automático de comissão da VEX Multimarcas.

---

# Estrutura Principal

Login

↓

Dashboard

↓

Nova Venda

↓

Histórico

↓

Relatórios

↓

Configurações

---

# Fluxo do Usuário

Usuário faz login

↓

Visualiza Dashboard

↓

Cadastra venda

↓

Venda é salva no Firestore

↓

Dashboard é atualizado

↓

Histórico é atualizado

↓

Relatório pode ser gerado

↓

Relatório pode ser exportado

---

# Estrutura das Telas

1 - Login

Função:

Autenticar usuário.

---

2 - Dashboard

Função:

Mostrar resumo do mês.

Informações:

Quantidade de vendas

Total tabela

Total vendido

Comissão Frank

Comissão Lucas

Botão Nova Venda

Botão Histórico

Botão Relatórios

---

3 - Nova Venda

Campos:

Veículo

Ano Modelo

Versão

Câmbio

Cor

Placa

KM

Data Venda

Preço Tabela

Preço Venda

Observação

Status

---

4 - Histórico

Função:

Listar todas as vendas.

Permitir:

Pesquisar

Editar

Excluir

Filtrar período

---

5 - Relatórios

Função:

Gerar relatório premium.

Exportações:

PNG

JPG

PDF

---

6 - Configurações

Função:

Alterar regras do sistema.

---

# Estrutura do Firestore

usuarios

vendas

configuracoes

relatorios

---

# Comissão

Cada veículo vendido:

R$ 250,00

Divisão:

Frank Luiz

R$ 125,00

Lucas Luiz

R$ 125,00

---

# Status da Venda

Vendido

Cancelado

Somente vendas com status Vendido entram na comissão.

---

# Identidade Visual

Tema:

Escuro

Paleta:

Preto

Vermelho

Branco

Estilo:

Premium Automotivo

---

# Objetivo da Versão 1.0

Login funcional

Dashboard moderno

Cadastro de vendas

Histórico

Relatórios premium

Exportação PDF

Exportação PNG

Exportação JPG

PWA instalável

Firebase Authentication

Firestore Database

Firebase Hosting