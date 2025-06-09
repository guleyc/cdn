(function() {
  const wsUrl =
    (location.protocol === "https:" ? "wss://" : "ws://") +
    "cdn.ore2b.com/parties/globe/default";

  try {
    const ws = new WebSocket(wsUrl);
  } catch (e) {}
})();
