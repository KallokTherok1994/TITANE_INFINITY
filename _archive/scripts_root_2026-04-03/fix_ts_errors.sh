#!/bin/bash
# Fix TypeScript TS4111 errors + override modifier order

echo "🔧 Fixing TypeScript errors..."

# Fix override modifier order in ErrorBoundary.tsx
sed -i 's/override static getDerivedStateFromError/static override getDerivedStateFromError/' src/components/ErrorBoundary.tsx
sed -i 's/override componentDidCatch/componentDidCatch/' src/components/ErrorBoundary.tsx

# Fix AutoHealErrorBoundary.tsx 
sed -i 's/override static getDerivedStateFromError/static override getDerivedStateFromError/' src/components/AutoHealErrorBoundary.tsx
sed -i 's/override render/render/' src/components/AutoHealErrorBoundary.tsx

# Fix TS4111 in evolutionEngine.ts
sed -i "s/metrics\.stability/metrics['stability']/g" src/cognitive/evolution/evolutionEngine.ts
sed -i "s/metrics\.coherence/metrics['coherence']/g" src/cognitive/evolution/evolutionEngine.ts
sed -i "s/metrics\.performance/metrics['performance']/g" src/cognitive/evolution/evolutionEngine.ts
sed -i "s/metrics\.cognitiveDepth/metrics['cognitiveDepth']/g" src/cognitive/evolution/evolutionEngine.ts

# Fix TS4111 in ChatIADiagnostic.tsx
sed -i "s/styles\.container/styles['container']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.header/styles['header']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.title/styles['title']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.button/styles['button']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.results/styles['results']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.empty/styles['empty']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.resultItem/styles['resultItem']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.resultHeader/styles['resultHeader']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.resultStatus/styles['resultStatus']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.resultTest/styles['resultTest']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.resultDuration/styles['resultDuration']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.resultData/styles['resultData']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.resultError/styles['resultError']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.summary/styles['summary']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.summaryTitle/styles['summaryTitle']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.summaryStats/styles['summaryStats']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.successMessage/styles['successMessage']/g" src/components/ChatIADiagnostic.tsx
sed -i "s/styles\.errorMessage/styles['errorMessage']/g" src/components/ChatIADiagnostic.tsx

echo "✅ TypeScript errors fixed"
