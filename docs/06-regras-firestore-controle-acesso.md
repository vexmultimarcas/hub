# Regras do Firestore — Controle de Acesso ADM / Usuário

Esta Sprint adiciona controle de acesso dentro do aplicativo.

## Perfil padrão

- Todo cadastro novo entra como `user`.
- Os e-mails `frank.since96@gmail.com` e `consultorjunior.auto@gmail.com` entram automaticamente como `admin`.
- Administradores podem alterar o perfil de outros usuários pelo painel **Usuários**.
- Usuários comuns não conseguem cadastrar, editar status, alterar transferência ou excluir vendas pela interface.

## Muito importante

A interface bloqueia os botões para usuários comuns, mas a proteção definitiva deve estar também nas regras do Firestore.

Use as regras abaixo no Firebase Console em:

Firestore Database > Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isJuniorAdminEmail() {
      return signedIn()
        && request.auth.token.email in ['frank.since96@gmail.com', 'consultorjunior.auto@gmail.com'];
    }

    function isAdmin() {
      return isJuniorAdminEmail()
        || (
          signedIn()
          && exists(/databases/$(database)/documents/users/$(request.auth.uid))
          && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        );
    }

    match /users/{userId} {
      allow read: if signedIn() && (request.auth.uid == userId || isAdmin());

      allow create: if signedIn() && request.auth.uid == userId && (request.resource.data.role == 'user' || isJuniorAdminEmail());

      allow update: if signedIn() && (
        isAdmin()
        || (
          request.auth.uid == userId
          && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])
        )
      );

      allow delete: if isAdmin();

      match /sales/{saleId} {
        allow read: if signedIn() && (request.auth.uid == userId || isAdmin());
        allow create, update, delete: if signedIn() && request.auth.uid == userId && isAdmin();
      }
    }
  }
}
```

## Observação

As vendas atuais continuam dentro de `users/{uid}/sales`, como já era na base estável. Nenhuma migração foi feita nesta Sprint.
