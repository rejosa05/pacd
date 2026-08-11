// =====================================================
// CLOCK
// =====================================================

function updateTime() {
  const now = new Date();
  const timeElement = document.getElementById("time");

  if (timeElement) {
    timeElement.textContent = now.toLocaleTimeString();
  }
}

setInterval(updateTime, 1000);
updateTime();

// =====================================================
// LOAD WAITING QUEUE FROM REST API
// =====================================================

async function loadWaitingQueue() {
  try {
    const response = await fetch("/api/display-queue/", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (!response.ok) {
      throw new Error("API request failed: " + response.status);
    }

    const data = await response.json();

    console.log("📦 Queue data:", data);

    // REGULAR
    displayWaitingQueue(data.regular || [], "regularCurrent", "regularNext");

    // PRIORITY
    displayWaitingQueue(data.priority || [], "fastCurrent", "fastNext");
  } catch (error) {
    console.error("❌ REST API error:", error);
  }
}

// =====================================================
// DISPLAY QUEUE
// =====================================================

function displayWaitingQueue(queues, currentId, nextId) {
  const current = document.getElementById(currentId);
  const next = document.getElementById(nextId);

  if (!current || !next) {
    console.error("❌ Queue elements not found:", currentId, nextId);
    return;
  }

  // RESET
  current.textContent = "00";
  next.innerHTML = "";

  if (!Array.isArray(queues) || queues.length === 0) {
    return;
  }

  // CURRENT
  current.textContent = queues[0];

  // NEXT 5
  const nextQueues = queues.slice(1, 6);

  nextQueues.forEach(function (queueNumber) {
    const span = document.createElement("span");

    span.textContent = queueNumber;

    next.appendChild(span);
  });
}

// =====================================================
// WEBSOCKET
// =====================================================

function connectQueueSocket() {
  if (!("WebSocket" in window)) {
    console.error("❌ WebSocket not supported");
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";

  const socket = new WebSocket(
    protocol + window.location.host + "/ws/queue-display/",
  );

  // =================================================
  // CONNECTED
  // =================================================

  socket.onopen = function () {
    console.log("✅ Queue Display WebSocket connected");
  };

  // =================================================
  // RECEIVE MESSAGE
  // =================================================

  socket.onmessage = function (event) {
    console.log("📡 WebSocket received:", event.data);

    try {
      const payload = JSON.parse(event.data);

      console.log("📦 PAYLOAD:", payload);
      console.log("🔔 EVENT:", payload.event);

      // IMPORTANT:
      // Check what event your Django Consumer sends
      console.log("🔔 Event:", payload.event);

      if (
        payload.event === "CLIENT_REGISTERED" ||
        payload.event === "QUEUE_UPDATED"
      ) {
        console.log("🔄 Updating queue display...");
        loadWaitingQueue();
      }
    } catch (error) {
      console.error("❌ WebSocket JSON error:", error);
    }
  };

  // =================================================
  // ERROR
  // =================================================

  socket.onerror = function (error) {
    console.error("❌ Queue Display WebSocket error:", error);
  };

  // =================================================
  // DISCONNECTED
  // =================================================

  socket.onclose = function () {
    console.log("❌ Queue Display WebSocket disconnected");

    console.log("🔄 Reconnecting in 3 seconds...");

    setTimeout(connectQueueSocket, 3000);
  };
}

// =====================================================
// INITIALIZE
// =====================================================

(function init() {
  // Initial queue
  loadWaitingQueue();

  // WebSocket
  connectQueueSocket();
})();
