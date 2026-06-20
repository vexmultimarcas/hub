# Sprint - Painel de Usuários ADM

## Objetivo

Separar definitivamente o Perfil do usuário logado do Painel Administrativo de Usuários.

## Perfil

O Perfil é individual.

Cada usuário pode alterar apenas:

- Nome de usuário

Cada usuário não pode alterar:

- E-mail
- Senha
- Tipo de acesso
- UID

## Usuários

A tela Usuários aparece apenas para contas com acesso Administrador.

Administradores podem:

- Ver usuários cadastrados no Firestore
- Promover usuário para Administrador
- Rebaixar Administrador para Usuário

Administradores não podem:

- Rebaixar a própria conta pelo painel

## Importante sobre novos usuários

Por segurança, a opção pública de Criar conta foi removida da tela de login.

Para adicionar um novo colaborador:

1. Abrir o Firebase Console.
2. Entrar em Authentication.
3. Clicar em Add user.
4. Criar e-mail e senha.
5. Entregar o acesso ao colaborador.
6. O colaborador faz o primeiro login no VEX HUB.
7. O sistema cria o documento dele em `users/{uid}` com `role = user`.
8. O Administrador pode abrir Usuários e mudar o papel, se necessário.

## Regra oficial

Todo novo acesso começa como Usuário.

Somente um Administrador pode transformar outro cadastro em Administrador.
