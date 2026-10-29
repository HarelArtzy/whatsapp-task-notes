(() => {
  const channel = "whatsapp-task-notes-v1";
  let queue = Promise.resolve();
  window.addEventListener("message", event => {
    if (event.source !== window || event.origin !== location.origin || event.data?.source !== channel) return;
    const data = event.data;
    if (data.kind === "status") {
      chrome.storage.local.set({ listenerStatus: { ready: data.ready === true, at: Date.now() } });
    } else if (data.kind === "message") {
      queue = queue.then(async () => {
        const msg = data.message;
        if (!msg || typeof msg.id !== "string" || typeof msg.text !== "string" || !Number.isFinite(msg.timestamp) || !Number.isFinite(msg.observedAt)) return;
        const state = await chrome.storage.local.get({ watching: false, startedAt: 0, endedAt: 0, sessionId: "", messages: [] });
        if (!state.sessionId || msg.observedAt < state.startedAt || (state.endedAt && msg.observedAt > state.endedAt) || Math.floor(msg.timestamp) < Math.floor(state.startedAt / 1000)) return;
        if (state.messages.some(item => item.sessionId === state.sessionId && item.key === msg.id)) return;
        const item = { key: msg.id, sessionId: state.sessionId, chat: String(msg.chat || "Unknown chat"), sender: String(msg.sender || "Unknown sender"), fromMe: msg.fromMe === true, timestamp: msg.timestamp, metadata: `[${new Date(msg.timestamp * 1000).toLocaleString()}] ${String(msg.sender || "Unknown sender")}: `, text: msg.text, capturedAt: new Date(msg.observedAt).toISOString() };
        await chrome.storage.local.set({ messages: [...state.messages, item].slice(-1000) });
      }).catch(error => console.error("Task Notes could not store a message", error));
    }
  });
  window.postMessage({ source: channel, kind: "status-request" }, location.origin);
})();
