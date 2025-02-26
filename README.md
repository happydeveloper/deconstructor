# Korean Word Deconstructor

한국어 문장을 분석하고 시각화하는 웹 애플리케이션입니다.

## 주요 기능

### 1. 문장 분석
- 한국어 문장을 형태소 단위로 분석
- 각 단어의 어원과 의미 설명
- 시각적 단어 구조 표현

### 2. 음성 지원 (TTS)
- ElevenLabs API를 활용한 고품질 음성 합성
- 언어 자동 감지 (한국어/영어)
- 언어별 최적화된 음성 설정:
  - 한국어: 자연스러운 억양과 발음
  - 영어: Rachel 음성으로 명확한 발음
- 효율적인 캐시 시스템:
  - 7일간 음성 데이터 캐시
  - 최대 50개 음성 저장
  - API 호출 최적화

### 3. 번역 연동
- Papago 번역 서비스 연동
- 원클릭으로 번역 페이지 이동

## 프로젝트 구조

```
├── app/
│   ├── api/
│   │   └── word-info/     # 단어 분석 API
│   └── layout.tsx         # 앱 레이아웃
├── components/
│   ├── deconstructor.tsx  # 주요 분석 컴포넌트
│   ├── search-history.tsx # 검색 히스토리
│   └── nodes/            # 시각화 노드 컴포넌트
├── utils/
│   ├── tts.ts           # 음성 합성 유틸리티
│   └── storage.ts       # 로컬 스토리지 관리
```

## 기술 스택

- Next.js 14
- React
- TypeScript
- TailwindCSS
- ElevenLabs API (TTS)
- Jotai (상태 관리)

## 환경 설정

1. 환경 변수 설정 (.env.local):

```bash
cp example.env .env.local
```
 
그런 다음 `.env.local` 파일을 편집하여 다음 API 키들을 추가하세요:



```env
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
GOOGLE_GENERATIVE_AI_API_KEY: Google AI Studio API 키
```

2. 패키지 설치:
```bash
npm install
# or
yarn install
```

3. 개발 서버 실행:
```bash
npm run dev
# or
yarn dev
```

## 스타일링

- Tailwind CSS를 사용한 스타일링
- 다크/라이트 모드 지원
- 반응형 디자인

## 상태 관리

- React 훅을 사용한 로컬 상태 관리
- Jotai를 사용한 전역 상태 관리

## 캐시 시스템

- 검색 히스토리 로컬 스토리지 저장
- TTS 음성 데이터 메모리 캐시
- API 호출 최적화

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

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
