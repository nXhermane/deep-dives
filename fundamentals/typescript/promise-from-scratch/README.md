# 🧠 Défi : Implémente `Promise` from scratch

L'objectif est de comprendre la mécanique interne de l'asynchronisme en JS en recréant la classe `Promise` (que nous appellerons `MyPromise`).

---

### 🎯 Objectifs techniques

1.  **Gestion des états** : Une promise commence en `PENDING` et finit en `FULFILLED` ou `REJECTED`. L'état ne peut changer qu'une seule fois.
2.  **Chaînage `.then()`** :
    *   Chaque `.then()` doit retourner une **nouvelle** instance de `MyPromise`.
    *   Le chaînage doit fonctionner même si la promise parente est déjà résolue.
3.  **Aplatissement (Unwrapping)** : Si un handler `.then()` retourne lui-même une promise, tu dois attendre sa résolution avant de passer à l'étape suivante de la chaîne.
4.  **Asynchronisme réel** : Utilise `queueMicrotask()` pour t'assurer que les callbacks s'exécutent dans la microtask queue (comme les vraies Promises).
5.  **Gestion des erreurs** : Implémente `.catch()` et assure-toi que les exceptions (`throw`) dans les handlers sont capturées et transmises.

---

### 🛠️ Exemple d'utilisation attendu

```typescript
const p = new MyPromise<number>((resolve, reject) => {
  setTimeout(() => resolve(42), 100);
});

p.then(val => val * 2)
 .then(val => {
   console.log(`Résultat : ${val}`); // → Résultat : 84
   return "C'est fini";
 })
 .then(res => console.log(res)); // → "C'est fini"
```

---

### 📏 Règles du jeu

*   **Interdiction d'utiliser `Promise` natif** (sauf pour comparer tes résultats).
*   **Interdiction d'utiliser `async/await`** à l'intérieur de ta classe.
*   **Bonus** : Implémente les méthodes statiques :
    *   `MyPromise.resolve(val)`
    *   `MyPromise.reject(err)`
    *   `MyPromise.all([p1, p2...])`

---

### 🚀 Démarrage

```bash
cd learning/experiments/ts_promise-from-scratch
bun dev
```
