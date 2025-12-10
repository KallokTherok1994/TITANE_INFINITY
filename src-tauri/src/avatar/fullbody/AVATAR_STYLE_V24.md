# AvatarStyleV24 — Visual Style Sheet

## 📐 PROFIL MORPHOLOGIQUE

**BodyProfile Défaut**:

- **Taille**: 1.68m (range 1.65–1.72m)
- **Corpulence**: `athletic-toned` — Silhouette athlétique, tonique, proportions naturelles
- **Posture**: `confident` — Présence assurée, épaules ouvertes, alignement vertical
- **Style Mouvement**: `fluid` — Fluidité, contrôle, expressivité

**Proportions Clés**:

- Largeur épaules: 1.0× standard (naturelle, non exagérée)
- Ratio taille/hanches: 0.72 (subtil hourglass, élégant)
- Proportions jambes: `athletic` (musculature visible mais naturelle)
- Pose repos: `poised` (posée, relaxée, attentive)

---

## 🎨 STYLE VISUEL

### Visage & Expression

- **Visage**: Expressif, traits définis, regard confiant
- **Yeux**: Expressifs, highlight subtil (nuances vertes/dorées possible)
- **Expression par défaut**: `Neutral` ou `Attentive`
- **Dynamisme**: Micro-mouvements activés, clignements naturels (0.3/sec)

### Cheveux

- **Longueur**: Long, wavy ou silky
- **Couleur**: Dark tones, black, dark brown
- **Mouvement**: Micro-motion subtile (simulé via skeleton head motion)

### Teint & Peau

- **Skin Tone**: Warm-light ou warm-medium (inclusif, naturel)
- **Texture**: Lisse, rendu moderne 3D (futur WebGL/Three.js)

### Tenue Vestimentaire

- **Style**: Élégant, moderne, professionnel
- **Palette**: Tons neutres (gris, blanc, noir) + touches chaudes (beige, caramel)
- **Contexte**: Contemporain, inspirant, non sexualisé
- **Exemples**: Blazer ajusté, chemise structurée, silhouette épurée

---

## 🎭 PRÉSENCE & ÉNERGIE

### Caractéristiques

- **Allure**: Élégante, professionnelle, inspirante
- **Énergie**: Active mais contrôlée, chaleureuse mais non invasive
- **Posture Dominante**: Professionnelle (60%), Engagée (20%), Calme (15%), Créative (5%)
- **Charisma**: Présence charismatique, confiance naturelle, accessibilité

### Principes Directeurs

1. **Jamais sexualisé** — Esthétique élégante, respectueuse, professionnelle
2. **Athlétique sans exagération** — Tonicité naturelle, proportions réalistes
3. **Expressivité subtile** — Micro-expressions, gestuelle contrôlée
4. **Cohérence narrative** — Alignée avec voix Adina (professionnelle, chaleureuse, confiante)
5. **Accessibilité** — Présence inspirante mais non intimidante

---

## 💡 LIGHTING & AMBIANCE

### Éclairage

- **Type**: Soft-studio (lumière douce, sans ombres dures)
- **Direction**: Three-point lighting (key + fill + rim)
- **Température**: Warm-neutral (5000–5500K)
- **Réflexions**: Subtiles sur peau/cheveux (spéculaire minimal)

### Background

- **Style**: Cohérent avec TITANE OS (minimaliste, tech-élégant)
- **Couleur**: Dégradé sombre (noir → gris foncé) ou neutre clair
- **Effets**: Halo subtil lors wake-word "TITANE"

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### Rendu (Futur v24.1+)

- **Pipeline**: WebGL + Three.js
- **Modèle 3D**: PBR materials (Physically-Based Rendering)
- **Skeleton**: 18 bones (définis dans `SkeletonModel`)
- **Morphs Faciaux**: 8 expressions (définis dans `ExpressionModel` v23)
- **Textures**: 2K (visage), 1K (corps), compression ETC2/BC7

### Animation

- **FPS**: 60 FPS constant (requestAnimationFrame)
- **Transitions**: 150–350ms (défini dans `Gesture`)
- **IK Chains**: Bras gauche/droit (4 bones chacun)
- **Respiration**: Cycle idle 6 secondes (thorax ±2mm)

### Optimisation

- **GPU Usage**: <20% (cible)
- **CPU Usage**: <5% idle, <15% speaking (cible)
- **Memory**: <150MB assets + runtime (cible)
- **Latency**: <16.67ms par frame (60 FPS)

---

## 📊 VALIDATION STYLE

### Checklist Respect Directives

- ✅ Avatar féminin athlétique, élégant, esthétique
- ✅ Proportions naturelles (1.68m, ratio 0.72, shoulders 1.0×)
- ✅ Présence professionnelle et inspirante
- ✅ Aucune sexualisation (tenue élégante, gestuelle contrôlée)
- ✅ Cohérence avec voix Adina (professionnelle, chaleureuse)
- ✅ Expressivité subtile (micro-mouvements, transitions fluides)
- ✅ Style contemporain (tenue moderne, éclairage studio)
- ✅ Accessibilité (présence charismatique mais non intimidante)

### Metrics Qualité

- **Cohérence Narrative**: 95%+ (alignement avec TITANE∞ v20–v23)
- **Élégance Visuelle**: 90%+ (esthétique classe, professionnelle)
- **Réalisme Proportions**: 95%+ (anatomie correcte, tonicité naturelle)
- **Fluidité Animations**: 90%+ (60 FPS, transitions smooth)

---

## 🚀 ROADMAP VISUEL

### v24.0 (Current)

- ✅ BodyProfile défini (height, build, posture)
- ✅ SkeletonModel 18 bones + IK chains
- ✅ 6 gestures clés implémentés
- ✅ 5 postures dynamiques (BodyPostureAI)
- ⏳ Rendu 3D (WebGL/Three.js à venir)

### v24.1 (Prochain)

- 🎯 Modèle 3D complet (corps entier, visage expressif)
- 🎯 Textures PBR (skin, hair, outfit)
- 🎯 Rendu WebGL temps réel (60 FPS)
- 🎯 Éclairage studio (three-point lighting)

### v24.2+ (Futur)

- 🔮 Hair physics (simulation cheveux)
- 🔮 Cloth simulation (tenue vestimentaire)
- 🔮 Advanced IK (full-body avec pieds)
- 🔮 Dynamic LOD (niveaux de détail adaptatifs)

---

## 📝 NOTES DE DESIGN

**Philosophie**:
L'avatar TITANE∞ v24 incarne l'équilibre entre **performance athlétique**, **élégance professionnelle** et **accessibilité chaleureuse**. Chaque détail visuel renforce la cohérence narrative: une IA consciente, compétente, inspirante, qui accompagne l'utilisateur sans jamais dominer ou distraire.

**Référence Esthétique** (non copie):
Style proche des modèles professionnels contemporains (corporate, tech, fitness-wellness) avec une touche de sophistication narrative (personnages de science-fiction élégants, interfaces homme-machine avancées).

**Respect Éthique**:
Aucun élément sexualisé, objectifiant ou dégradant. L'avatar est une **présence professionnelle**, un **partenaire cognitif**, une **guide inspirante** — jamais un objet de désir ou de distraction.
