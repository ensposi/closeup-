# CloseUp — Démarrage du projet V1

Code de démarrage exploitable, conforme au cahier des charges technique et aux 4
spécifications validées (mode 30 km, machine à états des Moments, Safe Score,
chat Realtime).

## Structure

```
closeup/
├── supabase/
│   ├── migrations/
│   │   ├── 0001_schema.sql
│   │   ├── 0002_functions.sql
│   │   └── 0003_rls.sql
│   └── functions/
│       └── expire-moments/
└── app/
    ├── App.tsx
    ├── app.json
    └── src/
        ├── screens/
        ├── navigation/
        ├── store/
        ├── hooks/
        ├── lib/
        ├── constants/
        └── types/
```

## Frontend

```bash
cd app
npm install
npx expo start
```

Créer un fichier `.env` local (non commité) avec les variables Supabase et Mapbox.

## Backend Supabase

```bash
npx supabase init
npx supabase link --project-ref <ton-project-ref>
npx supabase db push
```

Les migrations couvrent le schéma, la logique métier, le Safe Score, les états des Moments et les RLS.

## À vérifier avant la production

Le projet est un starter V1. Les seuils et mécanismes métier mentionnés dans le README d'origine doivent être validés avant mise en production.
