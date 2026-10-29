/*
 * Experimental listener for WhatsApp Web's in-memory message collection.
 * The event approach was informed by WPPConnect WA-JS, Apache-2.0;
 * see LICENSE-WA-JS.txt and README.md for attribution.
 * WhatsApp's internal module names and message models can change.
 */
(() => {
  const channel = "whatsapp-task-notes-v1";
  let attachedStore = null;
  let handler = null;
  const send = (kind, payload = {}) => window.postMessage({ source: channel, kind, ...payload }, location.origin);
  const asString = value => {
    try { return typeof value === "string" ? value : value?._serialized || (value != null ? String(value) : ""); }
    catch { return ""; }
  };
  function emitMessage(message) {
    try {
      if (!message || message.isStatusV3 || message.type === "e2e_notification") return;
      const fromMe = Boolean(message.isSentByMe || message.id?.fromMe || message.self === "out");
      const text = typeof message.body === "string" ? message.body : (typeof message.caption === "string" ? message.caption : "");
      if (!text.trim() || message.type === "ciphertext") return;
      const timestamp = Number(message.t);
      const id = asString(message.id);
      if (!id || !Number.isFinite(timestamp) || timestamp <= 0) return;
      const chat = asString(fromMe ? message.to : message.from) || asString(message.id?.remote) || "Unknown chat";
      const sender = fromMe ? "You" : (typeof message.notifyName === "string" && message.notifyName.trim() ? message.notifyName : (asString(message.author) || chat));
      send("message", { message: { id, text, chat, sender, fromMe, timestamp, observedAt: Date.now() } });
    } catch (error) { console.error("Task Notes: could not read a message event", error); }
  }
  function findStore() {
    if (typeof window.importNamespace !== "function") return null;
    try {
      const module = window.importNamespace("WAWebMsgCollection");
      const candidates = [module?.MsgCollection, module?.default, module?.default?.MsgCollection];
      return candidates.find(candidate => candidate && typeof candidate.on === "function" && typeof candidate.processMultipleMessages === "function") || null;
    } catch { return null; }
  }
  function connect() {
    const store = findStore();
    if (store && store !== attachedStore) {
      if (attachedStore && handler && typeof attachedStore.off === "function") attachedStore.off("add", handler);
      handler = message => {
        if (!message || (!message.isNewMsg && !(message.isSentByMe || message.id?.fromMe || message.self === "out"))) return;
        if (message.type === "ciphertext" && typeof message.once === "function") {
          message.once("change:type", () => emitMessage(message));
        } else {
          emitMessage(message);
        }
      };
      store.on("add", handler);
      attachedStore = store;
    }
    send("status", { ready: Boolean(store && store === attachedStore), at: Date.now() });
  }
  window.addEventListener("message", event => {
    if (event.source === window && event.origin === location.origin && event.data?.source === channel && event.data.kind === "status-request") connect();
  });
  connect();
  setInterval(connect, 5000);
})();
