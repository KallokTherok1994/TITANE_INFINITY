import { useChat } from './src/hooks/useChat.ts';

console.log('imported useChat', typeof useChat);
setTimeout(() => {
  console.log('still alive');
}, 1000);
