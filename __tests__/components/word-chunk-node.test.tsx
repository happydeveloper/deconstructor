import { describe, it, expect, beforeEach, afterEach } from 'jest';
import { render, fireEvent, screen } from '@testing-library/react';
import { WordChunkNode } from '@/components/nodes/word-chunk-node';
import { Provider } from 'jotai';
import { expect as jestExpect } from '@jest/globals';
import '@testing-library/jest-dom';

describe("WordChunkNode", () => {
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

  it('renders node with correct text', () => {
    render(
      <Provider>
        <WordChunkNode data={mockData} />
      </Provider>
    );
    const element = screen.getByText('테스트');
    expect(element).toBeDefined();
  });

  it('handles TTS functionality', () => {
    const mockSpeak = jest.fn();
    window.speechSynthesis = { speak: mockSpeak } as unknown as SpeechSynthesis;

    render(
      <Provider>
        <WordChunkNode data={mockData} />
      </Provider>
    );

    const ttsButton = screen.getByTitle('발음 듣기');
    fireEvent.click(ttsButton);

    expect(mockSpeak).toHaveBeenCalled();
  });

  it('prevents event propagation on TTS button click', () => {
    const mockStopPropagation = jest.fn();

    render(
      <Provider>
        <WordChunkNode data={mockData} />
      </Provider>
    );

    const ttsButton = screen.getByTitle('발음 듣기');
    fireEvent.click(ttsButton, { stopPropagation: mockStopPropagation });

    expect(mockStopPropagation).toHaveBeenCalled();
  });
}); 