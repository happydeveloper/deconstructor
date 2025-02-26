import { beforeAll } from "bun:test";
import '@testing-library/jest-dom'

beforeAll(() => {
  // Mock window.speechSynthesis
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: () => {},
      cancel: () => {}
    },
    writable: true
  });
}); 