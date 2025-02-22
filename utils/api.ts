export async function fetchDictionaryPreview(word: string) {
  const response = await fetch(`/api/dict-preview?word=${encodeURIComponent(word)}`);
  return response.text();
}

export async function fetchTranslation(text: string) {
  const response = await fetch(`/api/translate?text=${encodeURIComponent(text)}`);
  const result = await response.json();
  return result.translation;
} 