import WordDeconstructor from "@/components/deconstructor";
import { Metadata } from 'next';

// Next.js 페이지 Props 타입
type Props = {
  params: { word: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// 메타데이터 생성 함수
export async function generateMetadata(props: Props): Promise<Metadata> {
  const decodedWord = decodeURIComponent(props.params.word);
  return {
    title: `Word Analysis - ${decodedWord}`,
    description: `Analyzing the Korean word: ${decodedWord}`,
  };
}

// 페이지 컴포넌트
export default async function WordPage(props: Props) {
  try {
    const decodedWord = decodeURIComponent(props.params.word);

    return (
      <main className="min-h-screen">
        <WordDeconstructor initialWord={decodedWord} />
      </main>
    );
  } catch (error) {
    console.error('Error decoding word:', error);
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Invalid word format</div>
      </main>
    );
  }
}
