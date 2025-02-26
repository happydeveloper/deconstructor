import { beforeAll } from "bun:test";

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