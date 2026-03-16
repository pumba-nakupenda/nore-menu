# Architecture Review — Nore Menu

**Date**: 2026-03-16
**Scope**: Full application architecture review

---

## 1. Vue d'ensemble

**Nore Menu** est une plateforme SaaS de menus digitaux pour restaurants, ciblant le marché francophone africain (devise FCFA, support WhatsApp). L'architecture est un **monorepo** avec deux projets distincts :

| Couche | Technologie | Version |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) + React 19 + TypeScript | `next@16.1.6` |
| **Backend** | NestJS 11 + TypeScript | `@nestjs/core@11` |
| **Base de données** | Supabase (PostgreSQL + Auth + Realtime + Storage) | `@supabase/supabase-js@2.95` |
| **Styling** | Tailwind CSS v4 | inline classes |
| **Déploiement** | Vercel (frontend) | `vercel.json` présent |

---

## 2. Points forts

- **Stack moderne et cohérent** : Next.js 16 + NestJS 11 + Supabase forment un trio solide et bien intégré.
- **Modules backend bien découpés** : Auth, Menu, Orders, Staff, Analytics, Feedback, Shop, Upload, Email — chaque domaine métier a son propre module NestJS.
- **Supabase bien utilisé** : Auth, RLS, Realtime (pour les commandes), Storage (pour les images/logos).
- **Guard d'authentification** propre côté backend (`SupabaseGuard`).
- **Fonctionnalités riches** : POS, gestion du staff avec permissions granulaires, QR codes, analytics, feedback, i18n (FR/EN), drag & drop des catégories, CSV import/export.

---

## 3. Problèmes architecturaux identifiés

### 3.1 Fichiers page monolithiques (Critique)

Le problème **le plus important**. Les pages frontend sont des fichiers monolithiques massifs :

| Fichier | Lignes |
|---|---|
| `menu/[id]/page.tsx` (menu public) | **1186** |
| `admin/settings/page.tsx` | **924** |
| `admin/menu/page.tsx` | **861** |
| `pos/dashboard/page.tsx` | **746** |
| `admin/qr/page.tsx` | **632** |
| `admin/analytics/page.tsx` | **567** |
| `admin/master/page.tsx` | **528** |
| **Total des pages** | **7550** |

Chaque `page.tsx` contient tout : state, logique métier, fetch, UI, modales, formulaires. Il n'y a **aucun composant réutilisable** en dehors de `Magnetic.tsx` et `SmoothScroll.tsx`.

**Impact** : maintenance difficile, impossible de tester unitairement, duplication de code probable entre pages.

**Recommandation** : Extraire en composants + custom hooks. Exemple pour `admin/menu/page.tsx` :

```
components/admin/menu/
  CategoryList.tsx
  DishRow.tsx
  MenuModal.tsx
  BadgeEditor.tsx
hooks/
  useMenu.ts        (fetch + CRUD)
  useRestaurant.ts  (session + restaurant ID)
```

### 3.2 Double canal d'accès aux données

Le frontend fait des `fetch()` directement dans les composants page via le backend NestJS, **et** utilise aussi `supabase` directement depuis le client (accès DB).

- Via le **backend NestJS** : `fetch(NEXT_PUBLIC_API_URL/menu/...)`
- Via **Supabase directement** : `supabase.from('restaurants').select(...)`

**Impact** : Confusion sur la source de vérité, logique métier dupliquée, surface d'attaque plus large.

**Recommandation** : Centraliser tous les accès data via le backend NestJS et créer un `api.ts` client-side unique.

### 3.3 Middleware auth désactivé

```ts
// middleware.ts
export async function middleware(request: NextRequest) {
    // Désactivation temporaire du filtrage pour debug production
    return NextResponse.next()
}
```

Le middleware censé protéger les routes `/admin/*` est **désactivé**. L'auth repose uniquement sur le `useEffect` du layout, ce qui signifie que le contenu admin est brièvement rendu côté client avant la redirection.

**Recommandation** : Réactiver le middleware avec vérification du token Supabase SSR (`@supabase/ssr`).

### 3.4 Client Supabase frontend non-SSR

```ts
// supabaseClient.ts — un seul client global
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Avec Next.js 16 et `@supabase/ssr` (déjà installé !), il faudrait utiliser `createBrowserClient()` et `createServerClient()` pour gérer correctement les cookies et le SSR.

### 3.5 Pas de gestion d'état globale

Chaque page gère son propre state en isolation. Le `restaurantId`, les infos utilisateur, la devise, le statut `isMaster` sont re-fetched dans chaque page et dans le layout. Il n'y a aucun Context, Store, ou cache partagé.

**Recommandation** : Un `AuthContext` / `RestaurantContext` minimal éviterait des dizaines de requêtes redondantes.

### 3.6 Schéma SQL incomplet dans le repo

`supabase_schema.sql` ne contient que la table `orders` (34 lignes). Les tables `restaurants`, `categories`, `dishes`, `badges`, `staff`, etc. ne sont documentées nulle part dans le code source. Le schéma réel vit uniquement dans Supabase.

**Recommandation** : Utiliser les migrations Supabase CLI (`supabase db diff` / `supabase migration new`) pour versionner le schéma complet.

### 3.7 Couleurs / Design tokens en dur

Les couleurs (`#064e3b`, `#c5a059`, `#fdfcfb`) et les styles sont répétés en inline dans chaque fichier. Pas de thème centralisé.

**Recommandation** : Définir des variables CSS ou un thème Tailwind :

```css
@theme { --color-brand: #064e3b; --color-gold: #c5a059; }
```

### 3.8 Pas de tests frontend

Aucun test frontend. Le backend a quelques fichiers `.spec.ts` (squelettes générés par NestJS CLI) mais pas de tests substantiels.

### 3.9 Dépendances 3D lourdes

`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `three` et `postprocessing` sont installés. Ce sont des librairies 3D **très lourdes** (~500KB+ gzipped). À vérifier si elles sont réellement utilisées et nécessaires, sinon les supprimer pour réduire le bundle.

---

## 4. Matrice de priorités

| Priorité | Action | Effort | Impact |
|---|---|---|---|
| **P0** | Réactiver le middleware auth | Faible | Sécurité |
| **P0** | Uniformiser l'accès data (backend only) | Moyen | Sécurité + Maintenabilité |
| **P1** | Extraire composants des pages monolithiques | Élevé | Maintenabilité |
| **P1** | Ajouter un AuthContext / RestaurantContext | Faible | Performance + DX |
| **P1** | Migrer vers `@supabase/ssr` client (browser/server) | Faible | SSR + Auth correcte |
| **P2** | Versionner le schéma Supabase complet | Faible | Documentation |
| **P2** | Centraliser les design tokens | Faible | Consistance UI |
| **P3** | Auditer et potentiellement supprimer les deps 3D | Faible | Performance bundle |
| **P3** | Ajouter des tests (au moins backend services) | Moyen | Fiabilité |

---

## 5. Résumé

L'app fonctionne et offre un produit riche. Le backend est bien structuré en modules. Les principaux axes d'amélioration sont :

1. **Décomposer les pages monolithiques** en composants + hooks
2. **Sécuriser l'accès admin** (middleware + SSR auth)
3. **Unifier le canal d'accès aux données** (tout passe par le backend)
4. **Partager l'état global** (Context pour auth/restaurant)

Ces changements rendront le code significativement plus maintenable et sécurisé sans changer les fonctionnalités.
