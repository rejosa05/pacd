// =====================================================
// TRANSACTION LOGS
// =====================================================

let currentPage = 1;
const pageSize = 10;

let searchTimer = null;
let transactionSocket = null;

// =====================================================
// INIT
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  loadTransactionLogs();

  initializeFilters();

  connectTransactionWebSocket();
});

// =====================================================
// FILTERS
// =====================================================

function initializeFilters() {
  const search = document.getElementById("logSearch");
  const status = document.getElementById("statusFilter");
  const dateFrom = document.getElementById("dateFrom");
  const dateTo = document.getElementById("dateTo");

  if (search) {
    search.addEventListener("input", function () {
      clearTimeout(searchTimer);

      searchTimer = setTimeout(function () {
        currentPage = 1;

        loadTransactionLogs();
      }, 300);
    });
  }

  if (status) {
    status.addEventListener("change", function () {
      currentPage = 1;

      loadTransactionLogs();
    });
  }

  if (dateFrom) {
    dateFrom.addEventListener("change", function () {
      currentPage = 1;

      loadTransactionLogs();
    });
  }

  if (dateTo) {
    dateTo.addEventListener("change", function () {
      currentPage = 1;

      loadTransactionLogs();
    });
  }
}

// =====================================================
// LOAD LOGS
// =====================================================

async function loadTransactionLogs() {
  const search = document.getElementById("logSearch")?.value || "";

  const status = document.getElementById("statusFilter")?.value || "";

  const dateFrom = document.getElementById("dateFrom")?.value || "";

  const dateTo = document.getElementById("dateTo")?.value || "";

  const params = new URLSearchParams({
    page: currentPage,

    search: search,

    status: status,

    date_from: dateFrom,

    date_to: dateTo,
  });

  try {
    const response = await fetch(
      `${window.transactionLogsConfig.apiUrl}?${params.toString()}`,
      {
        method: "GET",

        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to load transaction logs.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("Unable to load transaction logs.");
    }

    renderStats(data.stats);

    renderTransactionTable(data.logs);

    renderPagination(data.pagination);
  } catch (error) {
    console.error(error);

    showToast("Failed to load transaction logs.", "error");
  }
}

// =====================================================
// STATISTICS
// =====================================================

function renderStats(stats) {
  setText("statTotal", stats.total);

  setText("statWaiting", stats.waiting);

  setText("statServing", stats.serving);

  setText("statServed", stats.served);

  setText("statForwarded", stats.forwarded);

  setText("statSkipped", stats.skipped);

  setText("statCatered", stats.catered);
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value ?? 0;
  }
}

// =====================================================
// TABLE
// =====================================================

function renderTransactionTable(logs) {
  const tbody = document.getElementById("logTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!logs.length) {
    tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">

                    No transaction logs found.

                </td>

            </tr>

        `;

    return;
  }

  logs.forEach(function (log) {
    const tr = document.createElement("tr");

    tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/40";

    tr.innerHTML = `

            <td class="px-4 py-3">

                <div class="font-semibold text-gray-900 dark:text-white">
                    ${escapeHtml(log.client || "Unknown")}
                </div>

                <div class="text-xs text-gray-500">
                    ${escapeHtml(log.queue_no || "—")}
                </div>

            </td>


            <td class="px-4 py-3">

                <span class="font-medium">
                    ${escapeHtml(log.action || "—")}
                </span>

            </td>


            <td class="px-4 py-3">

                ${escapeHtml(log.transaction_type || "—")}

            </td>


            <td class="px-4 py-3">

                ${statusBadge(log.transaction_status)}

            </td>


            <td class="px-4 py-3">

                ${log.forwarded_to ? escapeHtml(log.forwarded_to) : "—"}

            </td>


            <td class="whitespace-nowrap px-4 py-3 text-xs">

                ${escapeHtml(log.created_at)}

            </td>


            <td class="px-4 py-3">

                <div class="flex justify-end gap-2">

                    <button
                        onclick="openViewModal('${log.uid}')"
                        class="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200">

                        View

                    </button>


                    <button
                        onclick="openUpdateModal('${log.uid}')"
                        class="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">

                        Update

                    </button>


                    <button
                        onclick="openDeleteModal('${log.uid}')"
                        class="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">

                        Delete

                    </button>

                </div>

            </td>

        `;

    tbody.appendChild(tr);
  });
}

// =====================================================
// STATUS BADGE
// =====================================================

function statusBadge(status) {
  const classes = {
    Waiting:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",

    Serving: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",

    Served:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",

    Forwarded:
      "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",

    Skipped: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",

    Catered:
      "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  };

  const className = classes[status] || "bg-gray-100 text-gray-700";

  return `

        <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}">

            ${escapeHtml(status || "Unknown")}

        </span>

    `;
}

// =====================================================
// PAGINATION
// =====================================================

function renderPagination(pagination) {
  const container = document.getElementById("logPagination");

  if (!container) return;

  const { page, total_pages, total } = pagination;

  if (total === 0) {
    container.innerHTML = "";

    return;
  }

  let html = `

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <p class="text-sm text-gray-500 dark:text-gray-400">

                Page ${page} of ${total_pages}

                · ${total} transaction${total !== 1 ? "s" : ""}

            </p>


            <div class="inline-flex rounded-lg shadow-sm">

                <button
                    onclick="changePage(${page - 1})"
                    ${page <= 1 ? "disabled" : ""}
                    class="rounded-s-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white">

                    Previous

                </button>

    `;

  // Page numbers

  const start = Math.max(1, page - 2);

  const end = Math.min(total_pages, page + 2);

  for (let i = start; i <= end; i++) {
    html += `

            <button
                onclick="changePage(${i})"
                class="border-y border-gray-300 px-4 py-2 text-sm font-medium
                ${
                  i === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                }">

                ${i}

            </button>

        `;
  }

  html += `

                <button
                    onclick="changePage(${page + 1})"
                    ${page >= total_pages ? "disabled" : ""}
                    class="rounded-e-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white">

                    Next

                </button>

            </div>

        </div>

    `;

  container.innerHTML = html;
}

function changePage(page) {
  if (page < 1) return;

  currentPage = page;

  loadTransactionLogs();
}

// =====================================================
// VIEW
// =====================================================

async function openViewModal(uid) {
  try {
    const url = window.transactionLogsConfig.detailUrl.replace(
      "00000000-0000-0000-0000-000000000000",
      uid,
    );

    const response = await fetch(url);

    const data = await response.json();

    if (!data.success) {
      throw new Error("Unable to load transaction.");
    }

    const log = data.log;

    setText("viewQueue", log.queue_no ? `Queue No. ${log.queue_no}` : "");

    setText("viewClient", log.client || "—");

    setText("viewTransactionType", log.transaction_type || "—");

    setText("viewAction", log.action || "—");

    setText("viewStatus", log.transaction_status || "—");

    setText(
      "viewForwardedTo",
      log.forwarded_unit
        ? `${log.forwarded_division || ""} / ${log.forwarded_unit}`
        : "—",
    );

    setText("viewSurvey", log.survey_form || "—");

    const details = document.getElementById("viewDetails");

    if (details) {
      details.textContent = log.details || "No details.";
    }

    const remarks = document.getElementById("viewRemarks");

    if (remarks) {
      remarks.textContent = log.remarks || "No remarks.";
    }

    openModal("viewTransactionModal");
  } catch (error) {
    console.error(error);

    showToast("Failed to load transaction.", "error");
  }
}

// =====================================================
// UPDATE
// =====================================================

async function openUpdateModal(uid) {
  try {
    const url = window.transactionLogsConfig.detailUrl.replace(
      "00000000-0000-0000-0000-000000000000",
      uid,
    );

    const response = await fetch(url);

    const data = await response.json();

    if (!data.success) {
      throw new Error("Unable to load transaction.");
    }

    const log = data.log;

    document.getElementById("updateUid").value = uid;

    document.getElementById("updateAction").value = log.action || "";

    document.getElementById("updateStatus").value =
      log.transaction_status || "";

    document.getElementById("updateTransactionType").value =
      log.transaction_type || "";

    document.getElementById("updateDetails").value = log.details || "";

    document.getElementById("updateRemarks").value = log.remarks || "";

    openModal("updateTransactionModal");
  } catch (error) {
    console.error(error);

    showToast("Failed to load transaction.", "error");
  }
}

// =====================================================
// UPDATE SUBMIT
// =====================================================

document.addEventListener("submit", async function (event) {
  if (event.target.id !== "updateTransactionForm") {
    return;
  }

  event.preventDefault();

  const uid = document.getElementById("updateUid").value;

  const url = window.transactionLogsConfig.updateUrl.replace(
    "00000000-0000-0000-0000-000000000000",
    uid,
  );

  const payload = {
    action: document.getElementById("updateAction").value,

    transaction_status: document.getElementById("updateStatus").value,

    transaction_type: document.getElementById("updateTransactionType").value,

    details: document.getElementById("updateDetails").value,

    remarks: document.getElementById("updateRemarks").value,
  };

  try {
    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        "X-CSRFToken": getCsrfToken(),
      },

      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Update failed.");
    }

    closeModal("updateTransactionModal");

    showToast("Transaction updated successfully.", "success");

    loadTransactionLogs();
  } catch (error) {
    console.error(error);

    showToast(error.message || "Failed to update transaction.", "error");
  }
});

// =====================================================
// DELETE
// =====================================================

function openDeleteModal(uid) {
  document.getElementById("deleteUid").value = uid;

  openModal("deleteTransactionModal");
}

async function deleteTransaction() {
  const uid = document.getElementById("deleteUid").value;

  const url = window.transactionLogsConfig.deleteUrl.replace(
    "00000000-0000-0000-0000-000000000000",
    uid,
  );

  try {
    const response = await fetch(url, {
      method: "POST",

      headers: {
        "X-CSRFToken": getCsrfToken(),

        "X-Requested-With": "XMLHttpRequest",
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Delete failed.");
    }

    closeModal("deleteTransactionModal");

    showToast("Transaction deleted successfully.", "success");

    loadTransactionLogs();
  } catch (error) {
    console.error(error);

    showToast(error.message || "Failed to delete transaction.", "error");
  }
}

// =====================================================
// WEBSOCKET
// =====================================================

function connectTransactionWebSocket() {
  const wsStatus = document.getElementById("wsStatus");

  transactionSocket = new WebSocket(window.transactionLogsConfig.websocketUrl);

  transactionSocket.onopen = function () {
    updateWebSocketStatus(true);
  };

  transactionSocket.onmessage = function (event) {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "transaction_refresh") {
        loadTransactionLogs();
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  };

  transactionSocket.onclose = function () {
    updateWebSocketStatus(false);

    // Reconnect after 3 seconds

    setTimeout(connectTransactionWebSocket, 3000);
  };

  transactionSocket.onerror = function (error) {
    console.error("WebSocket error:", error);

    updateWebSocketStatus(false);
  };
}

function updateWebSocketStatus(connected) {
  const status = document.getElementById("wsStatus");

  if (!status) return;

  if (connected) {
    status.innerHTML = `

            <span class="h-2 w-2 rounded-full bg-green-500"></span>

            Live

        `;

    status.className =
      "inline-flex items-center gap-2 self-start rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300";
  } else {
    status.innerHTML = `

            <span class="h-2 w-2 rounded-full bg-red-500"></span>

            Reconnecting...

        `;

    status.className =
      "inline-flex items-center gap-2 self-start rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }
}

// =====================================================
// MODAL
// =====================================================

function openModal(id) {
  const modal = document.getElementById(id);

  if (!modal) return;

  modal.classList.remove("hidden");

  modal.classList.add("flex");

  document.body.classList.add("overflow-hidden");
}

function closeModal(id) {
  const modal = document.getElementById(id);

  if (!modal) return;

  modal.classList.add("hidden");

  modal.classList.remove("flex");

  document.body.classList.remove("overflow-hidden");
}

// =====================================================
// TOAST
// =====================================================

function showToast(message, type = "success") {
  const toast = document.getElementById("transactionToast");

  if (!toast) return;

  toast.textContent = message;

  toast.className =
    "fixed right-5 top-5 z-[100] rounded-lg border px-4 py-3 text-sm font-medium shadow-lg";

  if (type === "success") {
    toast.classList.add("border-green-200", "bg-green-50", "text-green-800");
  } else {
    toast.classList.add("border-red-200", "bg-red-50", "text-red-800");
  }

  toast.classList.remove("hidden");

  setTimeout(function () {
    toast.classList.add("hidden");
  }, 3000);
}

// =====================================================
// CSRF
// =====================================================

function getCsrfToken() {
  return window.transactionLogsConfig.csrfToken || getCookie("csrftoken");
}

function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();

    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }

  return "";
}

// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
