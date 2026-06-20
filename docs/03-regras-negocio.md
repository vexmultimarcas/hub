# VEX HUB

## Regras Oficiais de Negócio

Versão 0.1 Alpha

--------------------------------------------

# 1 - Objetivo

Registrar vendas de veículos e gerar automaticamente os relatórios mensais e as comissões.

--------------------------------------------

# 2 - Usuários

Inicialmente o sistema possuirá dois usuários:

Frank Luiz

Lucas Luiz

A arquitetura deverá permitir novos usuários futuramente.

--------------------------------------------

# 3 - Comissão

Cada veículo vendido gera:

R$ 250,00

Divisão automática:

Frank Luiz

R$ 125,00

Lucas Luiz

R$ 125,00

Não existe vendedor responsável.

A comissão pertence sempre aos dois usuários.

--------------------------------------------

# 4 - Status da Venda

Status disponíveis:

Vendido

Cancelado

Somente vendas com status "Vendido" entram:

Dashboard

Relatórios

Comissões

--------------------------------------------

# 5 - Cadastro de Venda

Campos obrigatórios:

Veículo

Ano Modelo

Versão

Câmbio

Cor

Placa

KM Atual

Data Venda

Preço Tabela

Preço Venda

Status

Observação é opcional.

--------------------------------------------

# 6 - Dashboard

Deve apresentar:

Quantidade de veículos vendidos

Total tabela

Total vendido

Comissão Frank

Comissão Lucas

Todas as informações devem atualizar automaticamente.

--------------------------------------------

# 7 - Histórico

Permitir:

Pesquisar

Editar

Excluir

Filtrar período

Ordenar por data

--------------------------------------------

# 8 - Relatórios

Permitir seleção de:

Mês

Ano

Gerar automaticamente:

Quantidade de veículos

Total tabela

Total vendido

Comissão Frank

Comissão Lucas

Tabela completa

Exportações:

PDF

PNG

JPG

--------------------------------------------

# 9 - Layout

Tema escuro

Preto

Vermelho

Branco

Visual Premium Automotivo

Responsivo

PWA

--------------------------------------------

# 10 - Banco de Dados

Coleções previstas:

usuarios

vendas

configuracoes

relatorios

--------------------------------------------

# 11 - Versão 1.0

Não utilizar imagens dos veículos.

Não utilizar Firebase Storage.

Todo funcionamento deverá utilizar apenas:

Firebase Authentication

Firestore Database

Firebase Hosting

Objetivo:

Custo operacional zero.

--------------------------------------------

# 12 - Evolução futura

Adicionar:

Fotos

Clientes

Estoque

Financeiro

CRM

Metas

IA

Sem alterar a arquitetura principal.