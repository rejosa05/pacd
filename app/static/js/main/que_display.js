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

    // =================================================
    // REGULAR
    // =================================================

    displayWaitingQueue(data.regular || [], "regularCurrent", "regularNext");

    // =================================================
    // PRIORITY
    // =================================================

    displayWaitingQueue(data.priority || [], "fastCurrent", "fastNext");
  } catch (error) {
    console.error("❌ REST API error:", error);
  }
}

// =====================================================
// DISPLAY QUEUE
// ONE FUNCTION ONLY
// =====================================================

function displayWaitingQueue(queues, currentId, nextId) {
  const current = document.getElementById(currentId);

  const next = document.getElementById(nextId);

  if (!current || !next) {
    console.error("❌ Queue elements not found:", currentId, nextId);

    return;
  }

  // =================================================
  // RESET DISPLAY
  // =================================================

  current.textContent = "00";

  next.innerHTML = "";

  // =================================================
  // NO WAITING CLIENT
  // =================================================

  if (!Array.isArray(queues) || queues.length === 0) {
    return;
  }

  // =================================================
  // FIRST CLIENT = MAIN
  // =================================================

  current.textContent = queues[0];

  // =================================================
  // NEXT CLIENTS
  // MAXIMUM 5
  //
  // queues[0] = MAIN
  // queues[1] = NEXT #1
  // queues[2] = NEXT #2
  // queues[3] = NEXT #3
  // queues[4] = NEXT #4
  // queues[5] = NEXT #5
  // =================================================

  const nextQueues = queues.slice(1, 6);

  nextQueues.forEach(function (queueNumber) {
    const span = document.createElement("span");

    span.textContent = queueNumber;

    next.appendChild(span);
  });
}

// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  loadWaitingQueue();
});
