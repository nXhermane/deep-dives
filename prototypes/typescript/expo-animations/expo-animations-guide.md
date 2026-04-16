# Projet d'apprentissage : Animations et Gestes avec Expo

## 🎯 Objectif du projet
Créer une application Expo qui explore les fonctionnalités de **React Native Reanimated**, **React Native Worklets** et **React Native Gesture Handler** à travers différents exercices pratiques.

---

## 📋 Prérequis

### Installation
```bash
npx create-expo-app@latest mon-projet-animations
cd mon-projet-animations
npx expo install react-native-reanimated react-native-gesture-handler
```

### Configuration
Ajoutez dans votre `babel.config.js` :
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // IMPORTANT : en dernier
  };
};
```

---

## 🏗️ Structure suggérée du projet

```
/screens
  - HomeScreen.js          (menu principal)
  - SimpleAnimations.js    (exercice 1)
  - GesturesScreen.js      (exercice 2)
  - WorkletsScreen.js      (exercice 3)
  - AdvancedScreen.js      (exercice 4)
/components
  - AnimatedBox.js
  - DraggableCard.js
```

---

## 📚 Exercices progressifs

### **Exercice 1 : Animations de base (30-45 min)**

#### Objectifs d'apprentissage
- Utiliser `useSharedValue`
- Comprendre `useAnimatedStyle`
- Maîtriser `withSpring` et `withTiming`

#### Tâches
1. Créer un carré qui s'agrandit au tap (scale)
2. Ajouter une rotation lors du tap
3. Faire une animation de rebond avec `withSpring`
4. Créer un bouton qui change de couleur progressivement
5. Combiner plusieurs animations avec `withSequence`

#### Concepts clés à explorer
- Différence entre `useState` et `useSharedValue`
- Quand utiliser `withSpring` vs `withTiming`
- Les propriétés `transform` disponibles

---

### **Exercice 2 : Gestes et interactions (45-60 min)**

#### Objectifs d'apprentissage
- Utiliser `PanGestureHandler`
- Comprendre `useAnimatedGestureHandler`
- Gérer les contextes de geste

#### Tâches
1. Créer un élément draggable (glisser-déposer)
2. Limiter le mouvement dans une zone définie
3. Ajouter un effet de "snap back" quand on relâche
4. Créer un swipe pour supprimer (comme les emails)
5. Implémenter un double-tap pour reset la position

#### Concepts clés à explorer
- Les événements `onStart`, `onActive`, `onEnd`
- Utilisation de `context` pour sauvegarder l'état initial
- `runOnJS` pour appeler des fonctions JavaScript

---

### **Exercice 3 : Worklets avancés (45-60 min)**

#### Objectifs d'apprentissage
- Comprendre ce qu'est un worklet
- Utiliser `'worklet'` directive
- Faire des calculs sur le thread UI

#### Tâches
1. Créer une fonction worklet personnalisée
2. Implémenter un parallax effect lors du scroll
3. Créer un indicateur de progression animé
4. Faire un effet de "rubber band" aux limites
5. Synchroniser plusieurs animations

#### Concepts clés à explorer
- Différence entre thread JS et thread UI
- Quand utiliser `runOnJS`
- Performance : pourquoi les worklets sont plus rapides

---

### **Exercice 4 : Projet intégré (60-90 min)**

#### Défi final : Créer un carousel interactif

**Fonctionnalités requises :**
1. Swipe horizontal pour changer de carte
2. Animation de scale et opacity pendant le swipe
3. Indicateurs de position (dots)
4. Auto-play avec pause au touch
5. Snap automatique à la carte la plus proche

**Bonus :**
- Ajouter un effet de perspective 3D
- Implémenter un geste de "pinch to zoom"
- Créer des transitions personnalisées entre cartes

---

## 🔍 Points d'attention importants

### Performance
- Les animations doivent tourner à 60 FPS
- Éviter les re-renders inutiles
- Utiliser `useAnimatedStyle` pour tout ce qui est animé

### Debugging
- Utiliser `console.log` dans les worklets nécessite `runOnJS`
- Vérifier que le plugin Reanimated est bien en dernier dans Babel
- Tester sur un appareil réel pour les performances

### Bonnes pratiques
- Extraire les valeurs magiques en constantes
- Créer des composants réutilisables
- Commenter les worklets complexes

---

## 📖 Ressources utiles

### Documentation officielle
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)

### Concepts à approfondir
- **Shared Values** : variables réactives sur le thread UI
- **Worklets** : fonctions qui s'exécutent sur le thread UI
- **Animated Style** : styles dynamiques optimisés
- **Gesture Context** : état persistant pendant un geste

---

## ✅ Checklist de progression

### Niveau 1 - Débutant
- [ ] Créer une animation simple avec `withTiming`
- [ ] Utiliser `withSpring` pour un effet de rebond
- [ ] Combiner plusieurs transformations
- [ ] Créer un élément draggable basique

### Niveau 2 - Intermédiaire
- [ ] Gérer plusieurs gestes simultanés
- [ ] Créer des animations séquencées
- [ ] Utiliser `interpolate` pour des effets complexes
- [ ] Implémenter un swipe-to-delete

### Niveau 3 - Avancé
- [ ] Créer des worklets personnalisés
- [ ] Optimiser les performances (60 FPS constant)
- [ ] Synchroniser plusieurs animations
- [ ] Construire un composant réutilisable complexe

---

## 💡 Conseils pour apprendre efficacement

1. **Commencez simple** : Ne sautez pas d'étapes
2. **Expérimentez** : Changez les valeurs pour voir l'effet
3. **Lisez les erreurs** : Elles sont souvent très informatives
4. **Testez sur appareil** : Les performances sont différentes
5. **Consultez les exemples** : Le repo officiel a d'excellents exemples

---

## 🎓 Questions à vous poser pendant le développement

1. Pourquoi utiliser `useSharedValue` au lieu de `useState` ?
2. Quelle est la différence entre le thread JS et le thread UI ?
3. Quand dois-je utiliser `runOnJS` ?
4. Comment optimiser une animation qui lag ?
5. Pourquoi certaines fonctions doivent être des worklets ?

---

## 🚀 Après ce projet

Une fois terminé, vous saurez :
- Créer des animations fluides et performantes
- Gérer des gestes complexes
- Comprendre le fonctionnement interne de Reanimated
- Optimiser vos animations pour la production

**Prochain niveau** : Explorez React Native Skia pour des animations encore plus avancées !

---

Bon courage et amusez-vous bien ! 🎉