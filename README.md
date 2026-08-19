# CloseUp

Application mobile Expo / React Native pour créer et rejoindre des **Moments** locaux, avec Supabase pour l'authentification, les données et le chat temps réel.

## Lancer l'application avec Expo Go

### 1. Prérequis

- Node.js 20 LTS recommandé
- Git
- Expo Go sur l'iPhone ou Android
- Un projet Supabase

### 2. Cloner le projet

```bash
git clone https://github.com/ensposi/closeup-.git
cd closeup-/app
npm install
```

### 3. Configurer Supabase

Copie `app/.env.example` en `app/.env`, puis renseigne :

```env
EXPO_PUBLIC_SUPABASE_URL=https://TON_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TA_CLE_ANON
```

La clé `anon` est destinée au client mobile. **Ne mets jamais la `service_role` key dans l'application.**

### 4. Préparer la base Supabase

Depuis la racine du projet, avec la CLI Supabase installée et connectée à ton projet :

```bash
supabase link --project-ref TON_PROJECT_REF
supabase db push
```

Les migrations sont dans `supabase/migrations/` et doivent être appliquées dans l'ordre :

- `0001_schema.sql` — tables et extensions
- `0002_functions.sql` — logique des Moments et Safe Score
- `0003_rls.sql` — Row Level Security
- `0004_profile_trigger.sql` — création automatique des profils
- `0005_realtime.sql` — Realtime
- `0006_join_chat.sql` — création automatique du groupe de chat lorsqu'un utilisateur rejoint un Moment

### 5. Démarrer Expo

```bash
cd app
npx expo start
```

Scanne le QR code avec **Expo Go**. Pour un téléphone physique, le téléphone et l'ordinateur doivent normalement être sur le même réseau Wi-Fi.

### 6. Vérifier le projet

```bash
npm run typecheck
npx expo-doctor
```

Un workflow GitHub Actions exécute également ces contrôles à chaque push sur `main` et sur les pull requests.

## Stack

- Expo SDK 51
- React Native 0.74
- React Navigation
- `react-native-maps` pour rester compatible avec Expo Go
- Supabase Auth / Postgres / Realtime
- Zustand
- TypeScript

## Important

Le dépôt est préparé pour **le lancement et le test avec Expo Go**, mais les variables Supabase et le projet Supabase réel restent nécessaires. Je ne peux pas inventer ces identifiants et ils ne doivent pas être commités dans Git.
