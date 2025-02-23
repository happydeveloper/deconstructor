export const defaultCache = {
  "우리가 사랑한 한국어": {
    definition: {
      thought: "The phrase '우리가 사랑한 한국어' translates to 'The Korean language that we love'.",
      parts: [
        { id: "u", text: "우리", originalWord: "우리", origin: "Korean", meaning: "we" },
        { id: "ga", text: "가", originalWord: "가", origin: "Korean", meaning: "subject marker" },
        { id: "saranghan", text: "사랑한", originalWord: "사랑한", origin: "Korean", meaning: "loved" },
        { id: "hangu", text: "한국", originalWord: "한국", origin: "Korean", meaning: "Korea" },
        { id: "geo", text: "어", originalWord: "어", origin: "Korean", meaning: "language" }
      ],
      combinations: [
        [{ id: "uri", text: "우리", definition: "We", sourceIds: ["u"] }],
        [{ id: "uriga", text: "우리가", definition: "We who love", sourceIds: ["uri", "ga"] }],
        [{ id: "hangugeo", text: "한국어", definition: "Korean language", sourceIds: ["hangu", "geo"] }],
        [{ id: "final", text: "우리가 사랑한 한국어", definition: "Korean language that we love", sourceIds: ["uriga", "hangugeo"] }]
      ]
    },
    timestamp: Date.now()
  }
}; 