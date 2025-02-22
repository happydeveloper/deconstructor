export function speak(text: string, lang?: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang || detectLanguage(text);
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function detectLanguage(text: string): string {
  return /[a-zA-Z]/.test(text) ? 'en-US' : 'ko-KR';
}

export function speakSequentially(texts: string[], langs?: string[]) {
  let currentIndex = 0;
  
  const speakNext = () => {
    if (currentIndex >= texts.length) return;
    
    const utterance = speak(texts[currentIndex], langs?.[currentIndex]);
    utterance.onend = () => {
      currentIndex++;
      speakNext();
    };
  };

  speakNext();
} 