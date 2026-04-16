# 🧠 ts-reactive-signals-core

Un moteur de réactivité léger et performant en TypeScript, inspiré par SolidJS et Vue 3. Ce projet implémente les concepts fondamentaux de la programmation réactive avec un suivi automatique des dépendances.

## ✨ Fonctionnalités

- **Signal** : État atomique avec suivi de lecture/écriture.
- **Computed** : Valeurs dérivées synchrones.
- **Lazy Computed** : Valeurs dérivées avec évaluation "lazy" (calcul uniquement à la demande) et optimisation par notification de changement.
- **Effect** : Gestion des effets de bord avec nettoyage automatique (`cleanup`).
- **Batching** : Groupement des mises à jour pour éviter les recalculs inutiles.
- **Auto-tracking** : Détection automatique des dépendances sans besoin de tableaux de dépendances manuels.
- **Égalité Structurelle** : Support de l'égalité superficielle pour les objets et les tableaux pour éviter les notifications redondantes.

## 🚀 Installation

```bash
bun install
```

## 🛠️ Usage

### Signaux de base
```typescript
import { signal } from "./index";

const count = signal(0);
console.log(count.get()); // 0
count.set(5);
```

### Valeurs dérivées (Computed)
```typescript
import { signal, computed, lazyComputed } from "./index";

const count = signal(1);

// Calcul immédiat
const double = computed(() => count.get() * 2);

// Calcul à la demande (Lazy)
const triple = lazyComputed(() => {
  console.log("Calcul complexe...");
  return count.get() * 3;
});
```

### Effets de bord
```typescript
import { signal, effect } from "./index";

const name = signal("Alice");

const stop = effect(() => {
  console.log(`Bonjour ${name.get()}`);
  
  return () => {
    console.log("Nettoyage avant la prochaine exécution");
  };
});

name.set("Bob");
stop(); // Arrête l'effet
```

### Batching
```typescript
import { signal, batch, effect } from "./index";

const a = signal(0);
const b = signal(0);

effect(() => console.log(`Somme: ${a.get() + b.get()}`));

batch(() => {
  a.set(1);
  b.set(2);
}); // L'effet ne s'exécute qu'une seule fois à la fin du batch
```

## 📐 Détails Techniques

- **Gestion des dépendances** : Utilise une pile d'effets globaux pour capturer les accès aux signaux lors de l'exécution.
- **Égalité** : Compare les valeurs primitives, les tableaux et les objets (shallow) pour minimiser les déclenchements.
- **Nettoyage** : Les effets suppriment leurs anciens abonnements avant chaque ré-exécution pour supporter les dépendances dynamiques.

## 🏃 Démarrage en développement

```bash
bun dev
```
