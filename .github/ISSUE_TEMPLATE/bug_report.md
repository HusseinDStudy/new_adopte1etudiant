---
name: Rapport d'Anomalie
about: Signaler un bogue ou un comportement inattendu en production ou en test.
title: "[BUG] : Courte description de l'anomalie"
labels: bug, incident
assignees: ''
---

## Description de l'Anomalie

Décrivez clairement et concisement l'anomalie rencontrée. Incluez tout message d'erreur visible.

## Contexte

*   **Environnement :** [Production / Staging / Développement]
*   **Version Applicative :** [Ex: v1.2.0 ou SHA du commit: `abcdef12`]
*   **Composant(s) Affecté(s) :** [Ex: API (`apps/api`), Web (`apps/web`), Base de Données, CI/CD]
*   **Route(s) / Fonctionnalité(s) Affectée(s) :** [Ex: `/api/applications`, connexion utilisateur, envoi de message]

## Étapes de Reproduction

Fournissez les étapes détaillées pour reproduire l'anomalie. Soyez le plus précis possible.

1.  [Première étape]
2.  [Deuxième étape]
3.  [Etc.]

## Comportement Attendu

Décrivez ce que l'application devrait faire.

## Comportement Observé

Décrivez ce que l'application a fait, qui est contraire au comportement attendu.

## Logs Pertinents

Veuillez inclure tout log pertinent (messages d'erreur, stack traces) avec leur `reqId` si disponible, provenant de CloudWatch ou d'autres sources.

```
[Copier/Coller les logs ici, en anonymisant si nécessaire]
```
**`reqId` associé :** [Si applicable, ex: `xyz-123-abc`]

## Impact

Quel est l'impact de cette anomalie sur les utilisateurs ou le système ? (Ex: bloquant, dégradé, mineur, défaillance CI/CD)

## Priorité

[Critique / Élevée / Moyenne / Faible]

## Préconisation de Correction (Optionnel)

Si vous avez une idée de la cause racine ou une suggestion de correction.

