let allClient = [];
let pageSize = 10;
let currentPage = 1;

/* =====================================================
   INITIALS
===================================================== */

function initials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* =====================================================
   SUMMARY STATS
===================================================== */

function updateSummaryStats() {
  const total = allClient.length;
  const waiting = allClient.filter(
    (client) => (client.status || "Waiting") === "Waiting",
  ).length;
  const priority = allClient.filter(
    (client) => String(client.lane || "").toLowerCase() === "priority",
  ).length;
  const totalEl = document.getElementById("statTotalClients");
  const waitingEl = document.getElementById("statWaiting");
  const priorityEl = document.getElementById("statPriority");
  const statusEl = document.getElementById("statStatus");

  if (totalEl) totalEl.textContent = total;
  if (waitingEl) waitingEl.textContent = waiting;
  if (priorityEl) priorityEl.textContent = priority;
  if (statusEl) statusEl.textContent = total ? "Active" : "Idle";
}

/* =====================================================
   STATUS BADGE
===================================================== */

function statusBadge(status) {
  if (status === "Waiting") {
    return `
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        <span class="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                        ${status}
                    </span>
                `;
  }

  if (status === "Serving" || status === "Approved") {
    return `
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <span class="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                        ${status}
                    </span>
                `;
  }

  if (status === "Skipped" || status === "Forwarded") {
    return `
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <span class="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                        ${status}
                    </span>
                `;
  }

  return `
                <span class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    <span class="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
                    ${status || "Pending"}
                </span>
            `;
}

/* =====================================================
   RENDER CLIENT TABLE
===================================================== */

function renderClientTable() {
  const tbody = document.getElementById("clientTablebody");
  if (!tbody) return;

  const totalPages = Math.max(1, Math.ceil(allClient.length / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = allClient.slice(startIndex, startIndex + pageSize);

  if (!pageItems.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No registered client yet. When the kiosk registers a client, it will appear here automatically.</td></tr>`;
    updateSummaryStats();
    return;
  }

  tbody.innerHTML = pageItems
    .map(
      (client) => `
        <tr data-id="${client.id}" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white">${client.queue_no ?? "---"}</td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">${initials(client.full_name)}</span>
                    <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">${client.full_name || "Unknown Client"}</p>
                        <p class="truncate text-xs text-gray-500 dark:text-gray-400">${client.contact_number || "No contact"}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${client.lane === "Priority" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}">
                    ${client.lane || "Regular"}
                </span>
            </td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">${client.transaction_type || "---"}</td>
            <td class="px-4 py-3">${statusBadge(client.status || "Waiting")}</td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">${client.organization || "---"}</td>
            <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1.5">
                    <button type="button" title="Edit" onclick="openEditModal(${client.id})" class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/><circle cx="12" cy="12" r="2.25"/></svg>
                    </button>
                    <button type="button" title="Serve" class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-300">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
                    </button>
                    <button type="button" title="Forward" class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-300">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4.248 19C3.22 15.77 5.275 8.232 12.466 8.232V6.079a1.025 1.025 0 0 1 1.644-.862l5.479 4.307a1.108 1.108 0 0 1 0 1.723l-5.48 4.307a1.026 1.026 0 0 1-1.643-.861v-2.154C5.275 13.616 4.248 19 4.248 19Z"/></svg>
                    </button>
                    <button type="button" title="Skipped" onclick="skipClient(${client.id})" class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16 12h4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");

  updateSummaryStats();
}

// ---------- Modal helpers ----------
  function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }
  function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
  }
  document.querySelectorAll('[data-modal-hide]').forEach(btn => {
    btn.addEventListener('click', () => hideModal(btn.getAttribute('data-modal-hide')));
  });

  function notify(message) {
    const el = document.getElementById('transactionNotification');
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 2500);
  }

  // ---------- Edit ----------
  function openEditModal(queueNo) {
    showModal('editModal');
  }

//   function saveEditClient() {
//     const queueNo = document.getElementById('editQueueNo').value;
//     c.firstName = document.getElementById('editFirstName').value;
//     c.lastName = document.getElementById('editLastName').value;
//     c.contact = document.getElementById('editContact').value;
//     c.address = document.getElementById('editAddress').value;
//     c.gender = document.getElementById('editGender').value;
//     c.lane = document.getElementById('editLane').value;
//     c.transaction = document.getElementById('editTransaction').value;
//     hideModal('editModal');
//     renderTable();
//     notify(`Client ${c.queueNo} details updated.`);
//   }

//   // ---------- Serve ----------
//   function serveClient(queueNo) {
//     const c = findClient(queueNo);
//     if (!c) return;
//     c.status = 'Serving';
//     renderTable();
//     notify(`Now serving ${c.queueNo} — ${c.firstName} ${c.lastName}.`);
//   }

//   // ---------- Forward ----------
//   function openForwardModal(queueNo) {
//     const c = findClient(queueNo);
//     if (!c) return;
//     document.getElementById('forwardQueueNo').value = c.queueNo;
//     document.getElementById('forwardQueueBadge').textContent = c.queueNo;
//     document.getElementById('forwardClientName').textContent = `${c.firstName} ${c.lastName}`;
//     document.getElementById('forwardClientTransaction').textContent = c.transaction;
//     document.getElementById('forwardOffice').value = '';
//     document.getElementById('forwardRemarks').value = '';
//     showModal('forwardModal');
//   }

//   function saveForwardClient() {
//     const queueNo = document.getElementById('forwardQueueNo').value;
//     const c = findClient(queueNo);
//     if (!c) return;
//     const office = document.getElementById('forwardOffice').value;
//     if (!office) return;
//     c.status = 'Forwarded';
//     c.office = office;
//     hideModal('forwardModal');
//     renderTable();
//     notify(`${c.queueNo} forwarded to ${office}.`);
//   }

  // ---------- Skip ----------
  function skipClient(queueNo) {
    notify(`marked as skipped.`);
  }

/* =====================================================
   REST API
   LOAD EXISTING CLIENTS
===================================================== */

async function loadClients() {
  try {
    const response = await fetch("api/clients-list/", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unable to load clients");
    }

    allClient = Array.isArray(data.clients) ? data.clients : [];

    renderClientTable();

    console.log("✅ Existing clients loaded:", allClient);
  } catch (error) {
    console.error("❌ REST API error:", error);

    const tbody = document.getElementById("clientTablebody");

    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="px-4 py-8 text-center text-sm text-red-500">
                        ${error.message}
                    </td>
                </tr>
            `;
    }
  }
}

/* =====================================================
   NAVBAR NOTIFICATION
===================================================== */

function notifyNavbarBell(clientName) {
  const badge = document.getElementById("notify");

  const toast = document.getElementById("transactionNotification");

  const clientLabel = clientName || "New client";

  if (badge) {
    const currentCount = Number(badge.textContent || "0");

    const nextCount = Math.max(1, currentCount + 1);

    badge.textContent = String(nextCount);

    badge.style.display = "inline-flex";
  }

  if (toast) {
    toast.textContent = `Bag-ong client: ${clientLabel}`;

    toast.classList.remove("hidden");

    setTimeout(() => toast.classList.add("hidden"), 4000);
  }

  if (window.fetchPACDNotifications) {
    window.fetchPACDNotifications();
  }
}

/* =====================================================
   WEBSOCKET
===================================================== */

function connectQueueSocket() {
  if (!("WebSocket" in window)) {
    console.error("❌ WebSocket not supported");

    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";

  const socket = new WebSocket(
    protocol + window.location.host + "/ws/queue-display/",
  );

  /* =========================================
       CONNECTED
    ========================================= */

  socket.onopen = function () {
    console.log("✅ Dashboard WebSocket connected");
  };

  /* =========================================
       RECEIVE MESSAGE
    ========================================= */

  socket.onmessage = function (event) {
    console.log("📡 WebSocket received:", event.data);

    try {
      const payload = JSON.parse(event.data);

      console.log("📦 Parsed payload:", payload);

      /* =================================
                   CHECK EVENT

                   IMPORTANT:
                   Backend uses "event"
                   NOT "action"
                ================================= */

      if (payload.event !== "CLIENT_REGISTERED") {
        console.log("ℹ️ Ignored event:", payload.event);

        return;
      }

      /* =================================
                   GET CLIENT
                ================================= */

      const client = payload.client;

      if (!client) {
        console.error("❌ WebSocket client data is null");

        console.error("Received payload:", payload);

        return;
      }

      console.log("🟢 NEW CLIENT:", client);

      /* =================================
                   PREVENT DUPLICATE
                ================================= */

      const existingIndex = allClient.findIndex(
        (item) => String(item.id) === String(client.id),
      );

      if (existingIndex !== -1) {
        allClient.splice(existingIndex, 1);
      }

      /* =================================
                   ADD NEW CLIENT
                   TO TOP OF ARRAY
                ================================= */

      allClient.unshift(client);

      /* =================================
                   FIRST PAGE
                ================================= */

      currentPage = 1;

      /* =================================
                   UPDATE TABLE
                   WITHOUT REFRESH
                ================================= */

      renderClientTable();

      /* =================================
                   NOTIFICATION
                ================================= */

      notifyNavbarBell(client.full_name || "New client");

      console.log("✅ Client automatically added to table");
    } catch (error) {
      console.error("❌ WebSocket JSON error:", error);
    }
  };

  /* =========================================
       ERROR
    ========================================= */

  socket.onerror = function (error) {
    console.error("❌ WebSocket error:", error);
  };

  /* =========================================
       DISCONNECTED
    ========================================= */

  socket.onclose = function () {
    console.log("❌ WebSocket disconnected");

    console.log("🔄 Reconnecting in 3 seconds...");

    setTimeout(connectQueueSocket, 3000);
  };
}

/* =====================================================
   INITIALIZE
===================================================== */

(function init() {
  console.log("🚀 Initializing dashboard...");

  /*
   * Load existing clients
   * through REST API
   */

  loadClients();

  /*
   * Connect WebSocket
   * for realtime updates
   */

  connectQueueSocket();

  /*
   * Update statistics
   */

  updateSummaryStats();
})();
