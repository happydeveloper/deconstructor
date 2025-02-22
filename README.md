# 단어 분석기

Next.js, React Flow로 구축되고 AI로 구동되는 단어를 의미 있는 부분으로 분해하고 어원을 설명하는 아름답고 인터랙티브한 웹 애플리케이션입니다.

## 주요 기능

- 🔍 인터랙티브한 단어 분석
- 🌳 React Flow를 사용한 단어 구성 요소의 아름다운 시각화
- 📚 상세한 어원과 의미 분석
- 🎨 다크 모드
- ⚡ 실시간 업데이트와 애니메이션
- 🧠 OpenRouter API를 활용한 AI 기반 단어 분해

## 사전 요구사항

시작하기 전에 다음 사항을 확인하세요:

- Node.js 18+ 설치
- OpenRouter API 키 ([OpenRouter](https://openrouter.ai)에서 발급 가능)
- Google Generative AI API 키 ([Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급 가능)

## 시작하기

1. 저장소 복제:

```bash
git clone 
cd deconstructor
```

2. 의존성 설치:

```bash
bun install
```

3. 환경 변수 설정:

```bash
cp example.env .env.local
```

그런 다음 `.env.local` 파일을 편집하여 다음 API 키들을 추가하세요:
- OPENROUTER_API_KEY: OpenRouter API 키
- GOOGLE_GENERATIVE_AI_API_KEY: Google AI Studio API 키

4. 개발 서버 실행:

```bash
bun dev
```

5. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 작동 방식

단어 분석기는 다음과 같이 단어를 구성 요소로 분해합니다:

1. 입력 필드에 원하는 단어 입력
2. AI가 단어의 어원과 구성 요소를 분석
3. 그래프 시각화를 통해 다음 사항을 표시:
   - 개별 단어 구성 요소
   - 각 구성 요소의 출처 (라틴어, 그리스어 등)
   - 각 구성 요소의 의미
   - 구성 요소들이 전체 단어를 형성하는 방식

## 기술 스택

- [Next.js](https://nextjs.org/) - React 프레임워크
- [React Flow](https://reactflow.dev/) - 그래프 시각화
- [Tailwind CSS](https://tailwindcss.com/) - 스타일링
- [OpenRouter AI](https://openrouter.ai/) - AI 기반 단어 분석
- [TypeScript](https://www.typescriptlang.org/) - 타입 안정성
- [Jotai](https://jotai.org/) - 상태 관리

## 기여하기

기여는 언제나 환영합니다! 자유롭게 Pull Request를 제출해 주세요.

## 현지화
- 한국어 지원
- 영어 지원

## 라이선스
