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
- Cadastrar novo colaborador pelo painel
- Promover usuário para Administrador
- Rebaixar Administrador para Usuário

Administradores não podem:

- Rebaixar a própria conta pelo painel

## Importante sobre novos usuários

Por segurança, a opção pública de Criar conta foi removida da tela de login.

O caminho recomendado é:

1. Entrar no app com uma conta Administrador.
2. Abrir **Usuários**.
3. Usar **Cadastrar colaborador**.
4. O sistema cria o acesso no Firebase Authentication e o documento `users/{uid}` no Firestore com `role = user`.
5. O Administrador pode promover o usuário, se necessário.

O caminho manual pelo Firebase Console também funciona:

1. Abrir o Firebase Console.
2. Entrar em Authentication.
3. Clicar em Add user.
4. Criar e-mail e senha.
5. Entregar o acesso ao colaborador.
6. O colaborador faz o primeiro login no VEX HUB.
7. O sistema cria o documento dele em `users/{uid}` com `role = user`.
8. O Administrador pode abrir Usuários e mudar o papel, se necessário.

Se o usuário for criado manualmente no Authentication, ele só aparece no painel depois do primeiro login ou depois que existir o documento correspondente em `users/{uid}`.

## Regra oficial

Todo novo acesso começa como Usuário.

Somente um Administrador pode transformar outro cadastro em Administrador.
