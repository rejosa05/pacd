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
// VOICE ANNOUNCEMENT
// =====================================================

let lastAnnouncedRegular = null;
let lastAnnouncedPriority = null;

// For division announcements
const lastAnnouncedDivision = {};

function speakQueue(queueNumber, destination) {
  if (!queueNumber || !destination) {
    return;
  }

  console.log(destination);
  // Cancel previous speech
  window.speechSynthesis.cancel();

  const message = `${queueNumber}, please proceed to ${destination}`;

  const speech = new SpeechSynthesisUtterance(message);

  speech.lang = "en-US";
  speech.rate = 0.85;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);

  console.log("🔊 ANNOUNCEMENT:", message);
}

// =====================================================
// ANNOUNCE MAIN QUEUE
// =====================================================

function announceMainQueue(queues, type) {
  if (!Array.isArray(queues) || queues.length === 0) {
    return;
  }

  const currentQueue = queues[0];

  if (type === "Priority") {
    // Only announce when queue changes
    if (lastAnnouncedPriority !== currentQueue) {
      lastAnnouncedPriority = currentQueue;

      speakQueue(`Priority ${currentQueue}`, "Priority Lane");
    }
  } else if (type === "Regular") {
    // Only announce when queue changes
    if (lastAnnouncedRegular !== currentQueue) {
      lastAnnouncedRegular = currentQueue;

      speakQueue(`Regular ${currentQueue}`, "Regular Lane");
    }
  }
}

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

    // =================================================
    // REGULAR
    // =================================================

    displayWaitingQueue(data.regular || [], "regularCurrent", "regularNext");

    announceMainQueue(data.regular || [], "Regular");

    // =================================================
    // PRIORITY
    // =================================================

    displayWaitingQueue(data.priority || [], "fastCurrent", "fastNext");

    announceMainQueue(data.priority || [], "Priority");

    // =================================================
    // NOW SERVING / DIVISIONS
    // =================================================

    displayNowServing(data.serving || {});
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
// DISPLAY NOW SERVING
// =====================================================

function displayNowServing(serving) {
  const divisions = ["RLED", "MSD", "LHSD", "RD_ARD"];

  divisions.forEach(function (division) {
    const container = document.getElementById(division);

    if (!container) {
      return;
    }

    container.innerHTML = "";

    const transactions = serving[division] || [];

    if (transactions.length === 0) {
      return;
    }

    transactions.forEach(function (transaction) {
      const div = document.createElement("div");

      div.className = "clients-list";

      div.textContent = `${transaction.queue_no} → ${transaction.unit}`;

      container.appendChild(div);

      // =================================================
      // DIVISION ANNOUNCEMENT
      // =================================================

      const queueNumber = transaction.queue_no;
      const unit = transaction.unit

      const announcementKey = `${unit}-${queueNumber}`;

      if (lastAnnouncedDivision[unit] !== announcementKey) {
        lastAnnouncedDivision[unit] = announcementKey;

        speakQueue(queueNumber, unit);
      }
    });
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
