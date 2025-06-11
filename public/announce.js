(function () {
  const wsUrl =
    (location.protocol === "https:" ? "wss://" : "ws://") +
    "cdn.ore2b.com/parties/globe/default";

  try {
    const ws = new WebSocket(wsUrl);

    ws.onopen = function () {
      console.log("WebSocket connection opened:", wsUrl);
    };
    ws.onmessage = function (event) {
      console.log("Message received:", event.data);
    };
    ws.onerror = function (error) {
      console.error("WebSocket error:", error);
    };
    ws.onclose = function () {
      console.log("WebSocket connection closed.");
    };
  } catch (e) {
    console.error("WebSocket connection error:", e);
  }
})();
