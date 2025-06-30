# Guide des Design Patterns du Projet

Ce document référence les principaux design patterns utilisés dans le projet "Campus ↔ Entreprise". Comprendre ces patterns est essentiel pour appréhender l'architecture du code et contribuer de manière cohérente.

Le projet utilise ces patterns de manière pragmatique, souvent sans `class` formelles, ce qui est typique du développement moderne en TypeScript/JavaScript.

---

## Patterns de Création

_Ces patterns fournissent des mécanismes de création d'objets qui augmentent la flexibilité et la réutilisation du code._

### **Singleton**

- **Objectif :** S'assurer qu'une classe n'a qu'une seule instance et fournir un point d'accès global à cette instance.
- **Application dans le projet :**
  - **Le client Prisma (`/packages/db-postgres`) est un Singleton.** Grâce au système de cache des modules Node.js, chaque `import { prisma } from 'db-postgres'` à travers l'application renvoie la **même et unique instance** du client Prisma. C'est crucial pour gérer efficacement le pool de connexions à la base de données.

---

## Patterns de Structure

_Ces patterns expliquent comment assembler des objets et des classes dans des structures plus grandes, tout en gardant ces structures flexibles et efficaces._

### **Facade**

- **Objectif :** Fournir une interface unifiée et simplifiée à un ensemble d'interfaces dans un sous-système.
- **Application dans le projet :**
  - **Les services frontend (`/apps/web/src/services`) sont une Facade.** Un composant React (ex: `OfferListPage`) n'a pas besoin de connaître la complexité de l'API `fetch`, la gestion des headers HTTP, la sérialisation JSON ou les URL exactes des endpoints. Il appelle simplement une fonction simple comme `offerService.getAllOffers()`. Le service agit comme une façade propre qui cache la complexité de la communication réseau.

---

## Patterns de Comportement

_Ces patterns concernent les algorithmes et l'attribution des responsabilités entre les objets._

### **Chain of Responsibility**

- **Objectif :** Permettre à une requête de passer le long d'une chaîne de "gestionnaires". Chaque gestionnaire décide soit de traiter la requête, soit de la passer au suivant dans la chaîne.
- **Application dans le projet :**
  - **Les middlewares Fastify (`/apps/api/src/middleware`) sont une Chain of Responsibility.** Sur une route protégée, la requête HTTP passe d'abord par `authMiddleware` (qui vérifie le JWT). S'il est valide, il passe la main à `roleMiddleware` (qui vérifie les permissions). Chaque maillon de la chaîne peut décider de bloquer la requête ou de la laisser continuer.

### **Observer**

- **Objectif :** Définir une relation de dépendance un-à-plusieurs entre des objets, de sorte que lorsqu'un objet (le "sujet") change d'état, tous ses dépendants (les "observateurs") sont notifiés et mis à jour automatiquement.
- **Application dans le projet :**
  - **Le Context API de React (`/apps/web/src/context`) est une implémentation du pattern Observer.**
    - L'`AuthProvider` est le **sujet** qui détient l'état d'authentification.
    - Les composants qui utilisent le hook `useAuth()` sont les **observateurs**.
    - Lorsque la fonction `logout()` est appelée, l'état du sujet change. Tous les composants observateurs sont alors automatiquement "notifiés" et se rendent à nouveau pour refléter ce nouvel état (par exemple, en affichant le bouton "Login" au lieu du "Profil").

### **Strategy**

- **Objectif :** Définir une famille d'algorithmes, mettre chacun d'eux dans une classe distincte et rendre leurs objets interchangeables.
- **Application dans le projet :**
  - **La gestion des middlewares d'authentification utilise le pattern Strategy.** Nous avons deux stratégies pour la validation d'une requête :
    1.  **Stratégie Stricte (`authMiddleware`) :** Rejette systématiquement la requête si l'utilisateur n'est pas authentifié.
    2.  **Stratégie Optionnelle (`optionalAuthMiddleware`) :** Laisse passer la requête même si l'utilisateur n'est pas authentifié (mais attache l'utilisateur s'il l'est).
  - L'application choisit la bonne stratégie à appliquer en fonction de la route. Par exemple, le callback de Google OAuth a besoin de la stratégie optionnelle pour gérer à la fois les nouveaux utilisateurs et ceux qui lient leur compte.
