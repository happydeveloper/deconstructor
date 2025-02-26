"use client";

import WordDeconstructor from "@/components/deconstructor";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const text = searchParams.get('text');

  // URL 파라미터로 전달된 텍스트가 있으면 디코딩하여 사용
  const initialWord = text ? decodeURIComponent(text) : undefined;

  // 현재 분석 중인 단어를 URL에 반영
  const updateUrl = (word: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('text', encodeURIComponent(word));
    router.replace(url.pathname + url.search);
  };

  return (
    <main>
      <WordDeconstructor 
        initialWord={initialWord} 
        onWordChange={updateUrl}
      />
    </main>
  );
}
