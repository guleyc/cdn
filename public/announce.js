(function() {
  const wsUrl =
    (location.protocol === "https:" ? "wss://" : "ws://") +
    "cdn.ore2b.com/parties/globe/default";
  try {
    const ws = new WebSocket(wsUrl);

    ws.onopen = function() {
      /*
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          ws.send(
            JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              source: "ore2b.com"
            })
          );
        });
      }
      */
    };

    ws.onerror = function() {};
    ws.onclose = function() {};
  } catch (e) {}
})();
