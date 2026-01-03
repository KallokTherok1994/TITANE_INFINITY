# Phase 6: Image Optimization - TITANE INFINITY v26.1

**Version:** v26.1.0  
**Date:** $(date +%Y-%m-%d)  
**Durée estimée:** 3h  
**Priorité:** P1 (Bandwidth optimization)

---

## 📊 ÉTAT ACTUEL

### Images Inventaire
```bash
Location: src/stories/assets/*.png
Total files: 10 images PNG
Total size: 732 KB (uncompressed)
Format: PNG 24-bit (pas de compression WebP)
Usage: Storybook documentation assets

Files:
- accessibility.png
- addon-library.png
- assets.png
- context.png
- docs.png
- figma-plugin.png
- share.png
- styling.png
- testing.png
- theming.png
```

### Impact Bundle Actuel
```
Images dans build: ~732 KB (inclus dans dist/assets/)
Chargement: Eager (pas de lazy-loading)
Format: PNG (pas de WebP compression)
Responsive: Non (pas de srcset)
```

---

## 🎯 OBJECTIFS PHASE 6

### P0: WebP Conversion Automatique (1h)
**Target:** -70% size (732 KB → ~220 KB)

**Actions:**
1. ✅ Installer vite-plugin-webp ou vite-imagetools
2. ✅ Configurer vite.config.ts pour conversion auto
3. ✅ Générer .webp + fallback .png
4. ✅ Vérifier qualité visuelle (SSIM > 0.95)

**Résultat attendu:**
```
Before: image.png (73 KB)
After:  image.webp (22 KB) + image.png fallback (73 KB)
Savings: -70% pour navigateurs modernes (95%+ users)
```

### P1: Lazy-Loading Images (1h)
**Target:** -300ms initial TTI

**Actions:**
1. ✅ Créer composant `<LazyImage>` avec Intersection Observer
2. ✅ Implémenter loading="lazy" native
3. ✅ Placeholder blur-up (LQIP - Low Quality Image Placeholder)
4. ✅ Appliquer à toutes images non-critiques

**Résultat attendu:**
```
Initial load: Seulement images above-the-fold
Below-fold: Chargées au scroll (lazy)
TTI impact: -300ms (images hors viewport initial)
```

### P2: Responsive Images srcset (30min)
**Target:** -150 KB mobile bandwidth

**Actions:**
1. ✅ Générer variants: 375px (mobile), 768px (tablet), 1920px (desktop)
2. ✅ Implémenter srcset + sizes attributes
3. ✅ Retina support: 2x variants
4. ✅ Art direction: <picture> si nécessaire

**Résultat attendu:**
```
Mobile 375px: Charge variant 375w (~15 KB vs 73 KB full)
Tablet 768px: Charge variant 768w (~35 KB)
Desktop 1920px: Charge variant 1920w (~73 KB)
Savings mobile: -80% bandwidth
```

### P3: Documentation + Validation (30min)
**Actions:**
1. ✅ Document conversion process
2. ✅ Guidelines utilisation LazyImage
3. ✅ Benchmarks avant/après
4. ✅ Commit + Release v26.1

---

## 🛠️ IMPLÉMENTATION DÉTAILLÉE

### Étape 1: Installation Plugin WebP

**Option A: vite-plugin-webp (Recommandé, simple)**
```bash
pnpm install --save-dev vite-plugin-webp
```

**Option B: vite-imagetools (Plus flexible)**
```bash
pnpm install --save-dev vite-imagetools
```

**Choix:** vite-plugin-webp pour Phase 6 (simplicité)

### Étape 2: Configuration vite.config.ts

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import webpPlugin from 'vite-plugin-webp'; // NOUVEAU

export default defineConfig({
  plugins: [
    react(),
    
    // PHASE 6: WebP Conversion Automatique
    webpPlugin({
      // Convertir tous PNG/JPG en WebP
      inputFormats: ['png', 'jpg', 'jpeg'],
      
      // Qualité WebP (80-90 optimal, balance size/quality)
      webpQuality: 85,
      
      // Générer aussi fallback PNG pour vieux browsers
      generateFallback: true,
      
      // Inclure toutes images de src/ et public/
      include: ['**/*.png', '**/*.jpg', '**/*.jpeg'],
      
      // Output: image.webp + image.png (fallback)
    }),
    
    // ... autres plugins (compression, PWA, etc.)
  ],
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Images séparées dans chunk distinct (lazy possible)
          'ui-images': [
            /src\/stories\/assets\/.*/,
          ],
          // ... autres chunks existants
        },
      },
    },
  },
});
```

### Étape 3: Créer Composant LazyImage

**Fichier:** `src/components/ui/LazyImage.tsx`

```typescript
import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string; // LQIP base64 ou couleur
  onLoad?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'data:image/svg+xml,...', // SVG blur placeholder
  onLoad,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    // Intersection Observer pour lazy-loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image visible dans viewport → charger
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Charger 50px avant scroll (anticipation)
        threshold: 0.01,
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [src]);
  
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`lazy-image ${isLoaded ? 'loaded' : 'loading'} ${className}`}
      width={width}
      height={height}
      onLoad={handleLoad}
      loading="lazy" // Fallback native lazy-loading
      decoding="async" // Async decode (non-bloquant)
    />
  );
};

// CSS pour transition blur-up
// src/components/ui/LazyImage.css
/*
.lazy-image {
  transition: filter 0.3s ease-in-out;
}

.lazy-image.loading {
  filter: blur(10px);
  opacity: 0.6;
}

.lazy-image.loaded {
  filter: blur(0);
  opacity: 1;
}
*/
```

### Étape 4: Utilisation Responsive srcset

**Exemple avec WebP + srcset:**

```tsx
// Avant (Phase 5):
<img src="/assets/screenshot.png" alt="Dashboard" />

// Après (Phase 6):
<picture>
  {/* WebP pour navigateurs modernes */}
  <source
    type="image/webp"
    srcSet="
      /assets/screenshot-375w.webp 375w,
      /assets/screenshot-768w.webp 768w,
      /assets/screenshot-1920w.webp 1920w
    "
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
  
  {/* PNG fallback (Safari < 14, IE) */}
  <source
    type="image/png"
    srcSet="
      /assets/screenshot-375w.png 375w,
      /assets/screenshot-768w.png 768w,
      /assets/screenshot-1920w.png 1920w
    "
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
  
  {/* Default fallback */}
  <LazyImage
    src="/assets/screenshot.png"
    alt="Dashboard"
    width={1920}
    height={1080}
  />
</picture>
```

**Automated avec vite-imagetools (optionnel Phase 6.1):**

```typescript
// Import avec transformations automatiques
import screenshot from './screenshot.png?webp&w=375;768;1920&format=webp;png';

// Usage simplifié:
<LazyImage
  src={screenshot.png}
  srcSet={screenshot.srcSet} // Auto-généré
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Dashboard"
/>
```

### Étape 5: Audit Images Existantes

**Script audit:** `scripts/audit-images.sh`

```bash
#!/bin/bash
# Audit toutes images du projet

echo "=== AUDIT IMAGES TITANE INFINITY ==="
echo ""

# Trouver toutes images
echo "📸 Images trouvées:"
find src public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) -exec du -h {} + | sort -h

echo ""
echo "📊 Statistiques:"
echo "Total PNG:" $(find src public -name "*.png" | wc -l)
echo "Total JPG:" $(find src public -name "*.jpg" -o -name "*.jpeg" | wc -l)
echo "Total WebP:" $(find src public -name "*.webp" | wc -l)
echo "Total GIF:" $(find src public -name "*.gif" | wc -l)

echo ""
echo "💾 Taille totale:"
find src public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) -exec du -ch {} + | grep total

echo ""
echo "🎯 Cibles conversion WebP:"
find src public -name "*.png" -o -name "*.jpg" -exec echo "  - {}" \;
```

---

## 📈 GAINS ATTENDUS

### Bandwidth Savings (Annual)

**Hypothèses:**
- 10,000 utilisateurs/mois
- Chaque utilisateur charge 10 images moyenne
- Images: 732 KB total → 220 KB WebP

```
Calcul:
Users/mois: 10,000
Charges/mois: 10,000 × 10 images = 100,000
Économie/charge: 732 KB - 220 KB = 512 KB
Économie/mois: 100,000 × 512 KB = 51.2 GB/mois
Économie/an: 51.2 × 12 = 614.4 GB/an

Cost savings (AWS CloudFront $0.085/GB):
614.4 GB × $0.085 = $52.22/an
```

### Performance Impact

```
Metric                  Before     After      Gain
────────────────────────────────────────────────────
Images total size       732 KB     220 KB    -70%
Initial load images     732 KB     147 KB    -80% (lazy)
Mobile bandwidth        732 KB     88 KB     -88% (srcset 375w)
TTI (images impact)     +450ms     +150ms    -300ms
LCP (if image-based)    2.1s       1.5s      -600ms
```

### Browser Support

```
Format          Support         Fallback
────────────────────────────────────────────
WebP            95%+ (Chrome, Firefox, Edge, Safari 14+)   PNG
Lazy loading    97%+ (native)   Intersection Observer
srcset          99%+ (modern)   Default src
```

---

## ✅ VALIDATION & TESTS

### Test 1: WebP Generation

```bash
# Après build
pnpm run build

# Vérifier fichiers .webp générés
ls -lh dist/assets/*.webp
# Attendu: Fichiers .webp présents (~70% plus petits que PNG)

# Vérifier fallback PNG aussi présents
ls -lh dist/assets/*.png
# Attendu: Fichiers .png encore présents (fallback)
```

### Test 2: Lazy-Loading Fonctionnel

**DevTools Network:**
1. Ouvrir page avec images
2. DevTools → Network → Filter: Img
3. Scroll down lentement
4. **Attendu:** Images chargées au scroll, pas toutes d'un coup

**Console timing:**
```javascript
// Mesurer temps chargement initial
performance.mark('images-start');
window.addEventListener('load', () => {
  performance.mark('images-end');
  performance.measure('images-load', 'images-start', 'images-end');
  console.log(performance.getEntriesByName('images-load')[0].duration);
});
// Attendu: < 200ms (vs ~450ms before)
```

### Test 3: Responsive srcset

**DevTools Device Mode:**
```
1. iPhone 13 (390px width):
   - Network → Img → Vérifier charge variant 375w.webp
   - Size: ~15 KB (vs 73 KB full)

2. iPad Pro (1024px width):
   - Network → Img → Vérifier charge variant 768w.webp
   - Size: ~35 KB

3. Desktop 4K (3840px width):
   - Network → Img → Vérifier charge variant 1920w.webp
   - Size: ~73 KB
```

### Test 4: Fallback PNG (Safari < 14)

**User-Agent simulation:**
```bash
# Simuler Safari 13 (pas de WebP)
curl -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/13.1.3" \
  https://domain.com/page-with-images

# Vérifier HTML retourné contient .png fallback
```

### Test 5: Lighthouse Audit

```bash
# Before Phase 6
lighthouse https://domain.com --view
# Performance: 95/100
# "Properly size images": Warning (732 KB unoptimized)

# After Phase 6
lighthouse https://domain.com --view
# Performance: 98/100 ✅
# "Properly size images": Pass ✅
# "Serve images in next-gen formats": Pass ✅
```

---

## 🚀 PLAN D'EXÉCUTION

### Jour 1: WebP + LazyImage (2h)

**10:00-10:30 - Setup WebP**
1. `pnpm install --save-dev vite-plugin-webp`
2. Configurer vite.config.ts
3. Test build: `pnpm run build`
4. Vérifier dist/assets/*.webp générés

**10:30-11:30 - LazyImage Component**
1. Créer src/components/ui/LazyImage.tsx
2. Créer src/components/ui/LazyImage.css
3. Tests unitaires LazyImage (optionnel)
4. Storybook story LazyImage (documentation)

**11:30-12:00 - Application Globale**
1. Script find/replace: `<img>` → `<LazyImage>`
2. Appliquer à src/stories/**/*.tsx
3. Vérifier visuellement aucune régression
4. Commit: "feat(v26.1): WebP conversion + LazyImage"

### Jour 1: Responsive srcset (1h)

**14:00-14:30 - Configuration srcset Generation**
1. Optionnel: Installer vite-imagetools pour variants auto
2. OU: Script manuel sharp pour générer 375w, 768w, 1920w
3. Configurer vite.config.ts build.assetsInlineLimit

**14:30-15:00 - Application srcset**
1. Identifier images critiques (hero, screenshots)
2. Appliquer `<picture>` + srcset pattern
3. Test responsive DevTools
4. Commit: "feat(v26.1): Responsive images srcset"

### Jour 1: Documentation + Release (30min)

**15:00-15:30 - Finalization**
1. Créer PHASE_6_IMAGE_OPTIMIZATION_COMPLETE_v26.1.md
2. Update CHANGELOG.md v26.1.0
3. Benchmarks avant/après (screenshots Lighthouse)
4. Git tag: `git tag v26.1.0`
5. Push: `git push origin MAIN --tags`

---

## 📋 CHECKLIST PHASE 6

### Code
- [ ] vite-plugin-webp installé et configuré
- [ ] LazyImage.tsx component créé
- [ ] LazyImage.css styles créés
- [ ] Toutes images src/stories/ converties
- [ ] srcset variants générés (375w, 768w, 1920w)
- [ ] <picture> fallback PNG implémenté

### Tests
- [ ] Build production: fichiers .webp générés ✅
- [ ] Lazy-loading fonctionne (DevTools Network)
- [ ] srcset responsive (mobile charge 375w)
- [ ] Fallback PNG (Safari < 14 simulation)
- [ ] 0 erreurs console
- [ ] Lighthouse "Next-gen formats": Pass

### Performance
- [ ] Images total: < 250 KB (vs 732 KB)
- [ ] Initial load: < 200 KB (lazy actif)
- [ ] Mobile bandwidth: < 100 KB (srcset 375w)
- [ ] TTI gain: -300ms
- [ ] Lighthouse Performance: 98+

### Documentation
- [ ] PHASE_6_IMAGE_OPTIMIZATION_COMPLETE_v26.1.md
- [ ] CHANGELOG.md updated v26.1.0
- [ ] Guidelines LazyImage usage
- [ ] Benchmarks screenshots inclus

### Git
- [ ] Commit: "feat(v26.1): WebP conversion + LazyImage"
- [ ] Commit: "feat(v26.1): Responsive images srcset"
- [ ] Commit: "docs(v26.1): Phase 6 complete documentation"
- [ ] Tag: v26.1.0
- [ ] Push origin MAIN + tags

---

## 🎯 SUCCESS CRITERIA

Phase 6 réussi si:

1. ✅ Images size: < 250 KB total (vs 732 KB, -66%+)
2. ✅ WebP support: 95%+ browsers (Chrome, Firefox, Safari 14+)
3. ✅ Lazy-loading: Initial load < 200 KB images
4. ✅ srcset mobile: -80% bandwidth (375w vs 1920w)
5. ✅ Lighthouse: "Next-gen formats" PASS, "Properly sized" PASS
6. ✅ TTI: -300ms (lazy non-critical images)
7. ✅ 0 visual regressions (quality SSIM > 0.95)
8. ✅ Build time: < +5s (WebP conversion rapide)

---

## 🔮 PHASE 7 PREVIEW (Optionnel)

Après Phase 6, opportunités:

**Phase 7: Font Optimization (-80 KB)**
- Font subsetting (Latin only, pas Cyrillic/CJK)
- WOFF2 compression (vs TTF)
- Preload critical fonts
- font-display: swap

**Phase 8: Vendor Lazy-Load (-400ms TTI)**
- AI ONNX runtime dynamic import
- Transformers.js lazy (only if AI used)
- Charts lazy-load (only in Stats page)

**Phase 9: Critical CSS Inline**
- Extract critical CSS above-fold
- Inline dans <head> (eliminate render-blocking)
- Async load full CSS

---

**Phase 6 prêt à démarrer!** 🚀

*Plan v26.1 - TITANE INFINITY Image Optimization*
