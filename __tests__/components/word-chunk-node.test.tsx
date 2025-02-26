import { render, fireEvent, screen } from '@testing-library/react';
import { WordChunkNode } from '@/components/nodes/word-chunk-node';
import { Provider } from 'jotai';

describe('WordChunkNode', () => {
  const mockData = {
    text: '테스트'
  };

  beforeEach(() => {
    // DOM에 필요한 요소들 추가
    document.body.innerHTML = `
      <input data-word-input="true" />
      <button data-analyze-button="true">분석하기</button>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('sets input value and triggers analysis on node click', () => {
    const mockClick = jest.fn();
    const analyzeButton = document.querySelector('[data-analyze-button="true"]');
    if (analyzeButton) {
      analyzeButton.addEventListener('click', mockClick);
    }

    render(
      <Provider>
        <WordChunkNode data={mockData} />
      </Provider>
    );

    const node = screen.getByText('테스트').closest('div[role="button"]');
    fireEvent.click(node!);

    const input = document.querySelector('[data-word-input="true"]') as HTMLInputElement;
    expect(input.value).toBe('테스트');
    expect(mockClick).toHaveBeenCalled();
  });

  it('renders node with correct text', () => {
    render(
      <Provider>
        <WordChunkNode data={mockData} />
      </Provider>
    );
    expect(screen.getByText('테스트')).toBeInTheDocument();
  });

  it('dispatches analyzeWord event on node click', () => {
    render(
      <Provider>
        <WordChunkNode data={mockData} />
      </Provider>
    );

    const node = screen.getByText('테스트').closest('div[role="button"]');
    fireEvent.click(node!);

    expect(document.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'analyzeWord',
        detail: { word: '테스트' }
      })
    );
  });

  it('prevents event propagation when clicking TTS button', () => {
    render(
      <Provider>
        <WordChunkNode data={mockData} />
      </Provider>
    );

    const ttsButton = screen.getByTitle('발음 듣기');
    const clickEvent = { stopPropagation: jest.fn() };
    
    fireEvent.click(ttsButton, clickEvent);
    expect(clickEvent.stopPropagation).toHaveBeenCalled();
  });
}); 