]633;E;{   echo "# INVARIANTS CHECK"\x3b   echo '```text'\x3b   rg -n "fetch\\(|XMLHttpRequest|WebSocket\\(|EventSource\\(|axios\\.|node:http|node:https|http://|https://" src/components src/pages src/App.tsx src/main.tsx src/hooks || true\x3b   echo '```'\x3b   echo '```text'\x3b   pnpm test:architecture\x3b   echo '```'\x3b } > "$PACK/03_INVARIANTS_CHECK.md";be3c1fb6-0edc-4eb4-a677-b5a41d3e956b]633;C# INVARIANTS CHECK
```text
src/pages/ResearchPage.tsx:83:    `https://fr.wikipedia.org/wiki/${slug}`,
src/pages/ResearchPage.tsx:84:    `https://fr.wikipedia.org/w/index.php?search=${query}`,
src/pages/ResearchPage.tsx:85:    `https://fr.wiktionary.org/wiki/${slug}`,
src/pages/ResearchPage.tsx:86:    `https://www.wikidata.org/wiki/Special:Search?search=${query}`,
src/components/ui/LazyImage.tsx:47:  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%231a1a1a'/%3E%3C/svg%3E",
src/components/ui/button.tsx:77:          xmlns="http://www.w3.org/2000/svg"
src/hooks/useChat.ts:1806:   curl -fsSL https://ollama.com/install.sh | sh
src/components/sections/ConversationSection.tsx:227:    `https://fr.wikipedia.org/wiki/${topicSlug}`,
src/components/sections/ConversationSection.tsx:228:    `https://fr.wikipedia.org/w/index.php?search=${topicQuery}`,
src/components/sections/ConversationSection.tsx:229:    `https://fr.wiktionary.org/wiki/${topicSlug}`,
src/components/sections/ConversationSection.tsx:230:    `https://www.wikidata.org/wiki/Special:Search?search=${topicQuery}`,
src/components/sections/ConversationSection.tsx:236:    target_url: seeds[0] ?? `https://fr.wikipedia.org/wiki/${topicSlug}`,
src/components/chat/ConversationsButton.tsx:39:        xmlns="http://www.w3.org/2000/svg"
src/components/chat/ChatModeSelector.css:267:  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
```
```text

> titane-infinity@27.2.0 test:architecture /home/titane-os/Documents/GitHub/TITANE_INFINITY
> cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/architecture


[1m[46m RUN [49m[22m [36mv4.0.18 [39m[90m/home/titane-os/Documents/GitHub/TITANE_INFINITY[39m

 [32m✓[39m [30m[45m core [49m[39m src/__tests__/architecture/engine-isolation.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 25[2mms[22m[39m

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 11:27:48
[2m   Duration [22m 571ms[2m (transform 81ms, setup 214ms, import 8ms, tests 25ms, environment 208ms)[22m

```
