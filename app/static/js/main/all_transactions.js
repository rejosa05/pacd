// =====================================================
// TRANSACTION LOGS
// =====================================================

let currentPage = 1;
const pageSize = 10;

let searchTimer = null;
let transactionSocket = null;
let lastLogs = [];
let lastFocused = null;

// =====================================================
// INIT
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  loadTransactionLogs();
  initializeFilters();
  initializeStatusTiles();
  initializeToolbar();
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

  [status, dateFrom, dateTo].forEach(function (element) {
    if (!element) return;
    element.addEventListener("change", function () {
      currentPage = 1;
      loadTransactionLogs();
    });
  });

  const clear = document.getElementById("clearFilters");
  if (clear) {
    clear.addEventListener("click", function () {
      if (search) search.value = "";
      if (status) status.value = "";
      if (dateFrom) dateFrom.value = "";
      if (dateTo) dateTo.value = "";
      currentPage = 1;
      loadTransactionLogs();
    });
  }
}

function initializeStatusTiles() {
  document.querySelectorAll("[data-status-tile]").forEach(function (tile) {
    tile.addEventListener("click", function () {
      const status = document.getElementById("statusFilter");
      if (!status) return;

      const value = tile.getAttribute("data-status-tile");
      status.value = status.value === value ? "" : value;

      currentPage = 1;
      loadTransactionLogs();
    });
  });
}

function initializeToolbar() {
  const refresh = document.getElementById("refreshLogs");
  if (refresh) {
    refresh.addEventListener("click", function () {
      loadTransactionLogs();
    });
  }

  const exportBtn = document.getElementById("exportLogs");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportCurrentPage);
  }

  // Close whichever modal is open on Escape.
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    ["viewTransactionModal", "updateTransactionModal", "deleteTransactionModal"].forEach(function (id) {
      const modal = document.getElementById(id);
      if (modal && !modal.classList.contains("hidden")) closeModal(id);
    });
  });

  // Close the row menu when clicking anywhere else.
  document.addEventListener("click", function (event) {
    if (!event.target.closest("[data-row-menu]")) closeRowMenus();
  });
}

function syncFilterChrome() {
  const search = document.getElementById("logSearch")?.value || "";
  const status = document.getElementById("statusFilter")?.value || "";
  const dateFrom = document.getElementById("dateFrom")?.value || "";
  const dateTo = document.getElementById("dateTo")?.value || "";

  const clear = document.getElementById("clearFilters");
  if (clear) {
    clear.classList.toggle("hidden", !(search || status || dateFrom || dateTo));
  }

  document.querySelectorAll("[data-status-tile]").forEach(function (tile) {
    const active = tile.getAttribute("data-status-tile") === status;
    tile.classList.toggle("ring-2", active);
    tile.classList.toggle("ring-inset", active);
    tile.classList.toggle("ring-blue-600", active);
    tile.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

// =====================================================
// LOAD LOGS
// =====================================================

async function loadTransactionLogs() {
  const params = new URLSearchParams({
    page: currentPage,
    search: document.getElementById("logSearch")?.value || "",
    status: document.getElementById("statusFilter")?.value || "",
    date_from: document.getElementById("dateFrom")?.value || "",
    date_to: document.getElementById("dateTo")?.value || "",
  });

  syncFilterChrome();
  renderSkeleton();

  try {
    const response = await fetch(`${window.transactionLogsConfig.apiUrl}?${params.toString()}`, {
      method: "GET",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    if (!response.ok) throw new Error("Failed to load transaction logs.");

    const data = await response.json();
    if (!data.success) throw new Error("Unable to load transaction logs.");

    lastLogs = data.logs || [];

    renderStats(data.stats);
    renderTransactionTable(lastLogs);
    renderPagination(data.pagination);
  } catch (error) {
    console.error(error);
    renderError();
    showToast("Could not load the logs. Check your connection and try Refresh.", "error");
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
  if (element) element.textContent = value ?? 0;
}

// =====================================================
// SKELETON / EMPTY / ERROR STATES
// =====================================================

function renderSkeleton() {
  const tbody = document.getElementById("logTableBody");
  const cards = document.getElementById("logCardList");

  const bar = '<div class="h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>';

  if (tbody) {
    let rows = "";
    for (let i = 0; i < 5; i++) {
      rows += `<tr>${`<td class="px-4 py-4">${bar}</td>`.repeat(6)}</tr>`;
    }
    tbody.innerHTML = rows;
  }

  if (cards) {
    let items = "";
    for (let i = 0; i < 3; i++) {
      items += `<div class="space-y-2 p-4">${bar}${bar}</div>`;
    }
    cards.innerHTML = items;
  }
}

function emptyStateHtml() {
  return `
    <div class="px-6 py-14 text-center">
      <svg class="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
      <p class="mt-3 text-sm font-medium text-gray-900 dark:text-white">No transactions match these filters</p>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Widen the date range or clear the status filter to see more.</p>
      <button type="button" onclick="document.getElementById('clearFilters').click()"
        class="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
        Clear filters
      </button>
    </div>`;
}

function renderError() {
  const tbody = document.getElementById("logTableBody");
  const cards = document.getElementById("logCardList");

  const message = `
    <div class="px-6 py-12 text-center">
      <p class="text-sm font-medium text-gray-900 dark:text-white">The logs did not load</p>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">The server did not respond. Try again in a moment.</p>
      <button type="button" onclick="loadTransactionLogs()"
        class="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">Try again</button>
    </div>`;

  if (tbody) tbody.innerHTML = `<tr><td colspan="6">${message}</td></tr>`;
  if (cards) cards.innerHTML = message;
}

// =====================================================
// TABLE + MOBILE CARDS
// =====================================================

function renderTransactionTable(logs) {
  const tbody = document.getElementById("logTableBody");
  const cards = document.getElementById("logCardList");

  if (!logs.length) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6">${emptyStateHtml()}</td></tr>`;
    if (cards) cards.innerHTML = emptyStateHtml();
    return;
  }

  if (tbody) {
    tbody.innerHTML = logs
      .map(function (log) {
        return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                ${escapeHtml(initials(log.client))}
              </span>
              <div class="min-w-0">
                <div class="truncate font-semibold text-gray-900 dark:text-white">${escapeHtml(log.client || "Unknown client")}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Queue ${escapeHtml(log.queue_no || "—")}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3">
            <div class="text-gray-900 dark:text-white">${escapeHtml(log.transaction_type || "—")}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">${escapeHtml(log.action || "No action yet")}</div>
          </td>
          <td class="px-4 py-3">${statusBadge(log.transaction_status)}</td>
          <td class="px-4 py-3">${log.forwarded_to ? escapeHtml(log.forwarded_to) : '<span class="text-gray-400">—</span>'}</td>
          <td class="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">${escapeHtml(log.created_at)}</td>
          <td class="px-4 py-3 text-right">${rowMenu(log)}</td>
        </tr>`;
      })
      .join("");
  }

  if (cards) {
    cards.innerHTML = logs
      .map(function (log) {
        return `
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-semibold text-gray-900 dark:text-white">${escapeHtml(log.client || "Unknown client")}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Queue ${escapeHtml(log.queue_no || "—")} · ${escapeHtml(log.created_at)}</p>
            </div>
            ${statusBadge(log.transaction_status)}
          </div>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">${escapeHtml(log.transaction_type || "—")}</p>
          ${log.forwarded_to ? `<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Forwarded to ${escapeHtml(log.forwarded_to)}</p>` : ""}
          <div class="mt-3 flex gap-2">
            <button onclick="openViewModal('${log.uid}')" class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300">View</button>
            <button onclick="openUpdateModal('${log.uid}')" class="flex-1 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white">Update</button>
            <button onclick="openDeleteModal('${log.uid}')" class="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:text-red-400">Delete</button>
          </div>
        </div>`;
      })
      .join("");
  }
}

function rowMenu(log) {
  return `
    <div class="relative inline-block text-left" data-row-menu>
      <button type="button" onclick="toggleRowMenu(this)" aria-haspopup="true" aria-expanded="false"
        class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700">
        <span class="sr-only">Open actions</span>
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 16 3"><circle cx="2" cy="1.5" r="1.5"/><circle cx="8" cy="1.5" r="1.5"/><circle cx="14" cy="1.5" r="1.5"/></svg>
      </button>
      <div class="absolute right-0 z-20 mt-1 hidden w-44 rounded-lg border border-gray-200 bg-white py-1 text-left shadow-lg dark:border-gray-600 dark:bg-gray-700" data-row-menu-panel>
        <button onclick="openViewModal('${log.uid}')" class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">View details</button>
        <button onclick="openUpdateModal('${log.uid}')" class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Update</button>
        <div class="my-1 border-t border-gray-100 dark:border-gray-600"></div>
        <button onclick="openDeleteModal('${log.uid}')" class="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-600">Delete</button>
      </div>
    </div>`;
}

function toggleRowMenu(button) {
  const panel = button.parentElement.querySelector("[data-row-menu-panel]");
  const isOpen = !panel.classList.contains("hidden");

  closeRowMenus();

  if (!isOpen) {
    panel.classList.remove("hidden");
    button.setAttribute("aria-expanded", "true");
  }
}

function closeRowMenus() {
  document.querySelectorAll("[data-row-menu-panel]").forEach(function (panel) {
    panel.classList.add("hidden");
    panel.parentElement.querySelector("button")?.setAttribute("aria-expanded", "false");
  });
}

function initials(name) {
  if (!name) return "?";
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(function (part) {
      return part.charAt(0).toUpperCase();
    })
    .join("");
}

// =====================================================
// STATUS BADGE
// =====================================================

function statusBadge(status) {
  const classes = {
    Waiting: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    Serving: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Served: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Forwarded: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    Skipped: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    Catered: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  };

  const dots = {
    Waiting: "bg-amber-500",
    Serving: "bg-blue-500",
    Served: "bg-emerald-500",
    Forwarded: "bg-orange-500",
    Skipped: "bg-red-500",
    Catered: "bg-purple-500",
  };

  const className = classes[status] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  const dot = dots[status] || "bg-gray-400";

  return `<span class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}">
    <span class="h-1.5 w-1.5 rounded-full ${dot}"></span>${escapeHtml(status || "Unknown")}
  </span>`;
}

// =====================================================
// PAGINATION
// =====================================================

function renderPagination(pagination) {
  const container = document.getElementById("logPagination");
  if (!container) return;

  const { page, total_pages, total } = pagination;

  if (!total) {
    container.innerHTML = "";
    return;
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  let html = `
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing <span class="font-semibold text-gray-900 dark:text-white">${first}–${last}</span>
        of <span class="font-semibold text-gray-900 dark:text-white">${total}</span>
      </p>
      <div class="inline-flex">
        <button onclick="changePage(${page - 1})" ${page <= 1 ? "disabled" : ""}
          class="rounded-s-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          Previous
        </button>`;

  const start = Math.max(1, page - 2);
  const end = Math.min(total_pages, page + 2);

  for (let i = start; i <= end; i++) {
    html += `
      <button onclick="changePage(${i})" ${i === page ? 'aria-current="page"' : ""}
        class="border-y border-e border-gray-300 px-3.5 py-2 text-sm font-medium dark:border-gray-600 ${
          i === page ? "bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-white" : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        }">${i}</button>`;
  }

  html += `
        <button onclick="changePage(${page + 1})" ${page >= total_pages ? "disabled" : ""}
          class="rounded-e-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          Next
        </button>
      </div>
    </div>`;

  container.innerHTML = html;
}

function changePage(page) {
  if (page < 1) return;
  currentPage = page;
  loadTransactionLogs();
}

// =====================================================
// FETCH ONE LOG
// =====================================================

async function fetchLog(uid) {
  const url = window.transactionLogsConfig.detailUrl.replace("00000000-0000-0000-0000-000000000000", uid);
  const response = await fetch(url);
  const data = await response.json();

  if (!data.success) throw new Error("Unable to load transaction.");
  return data.log;
}

// =====================================================
// VIEW
// =====================================================

async function openViewModal(uid) {
  closeRowMenus();

  try {
    const log = await fetchLog(uid);

    setText("viewQueue", log.queue_no ? `Queue no. ${log.queue_no}` : "");
    setText("viewClient", log.client || "—");
    setText("viewTransactionType", log.transaction_type || "—");
    setText("viewAction", log.action || "—");
    setText("viewStatus", log.transaction_status || "—");
    setText("viewForwardedTo", log.forwarded_unit ? `${log.forwarded_division || ""} / ${log.forwarded_unit}` : "—");
    setText("viewSurvey", log.survey_form || "Not submitted");
    setText("viewDetails", log.details || "No details recorded.");
    // setText("viewRemarks", log.remarks || "No remarks recorded.");
    setText("viewRemarks", log.process_owner || "No remarks recorded.");

    const jump = document.getElementById("viewToUpdate");
    if (jump) {
      jump.onclick = function () {
        closeModal("viewTransactionModal");
        openUpdateModal(uid);
      };
    }

    openModal("viewTransactionModal");
  } catch (error) {
    console.error(error);
    showToast("That transaction could not be opened.", "error");
  }
}

// =====================================================
// UPDATE
// =====================================================

async function openUpdateModal(uid) {
  closeRowMenus();

  try {
    const log = await fetchLog(uid);

    document.getElementById("updateUid").value = uid;
    document.getElementById("updateAction").value = log.action || "";
    document.getElementById("updateStatus").value = log.transaction_status || "";
    document.getElementById("updateTransactionType").value = log.transaction_type || "";
    document.getElementById("updateDetails").value = log.details || "";
    document.getElementById("updateRemarks").value = log.remarks || "";

    openModal("updateTransactionModal");
    document.getElementById("updateAction")?.focus();
  } catch (error) {
    console.error(error);
    showToast("That transaction could not be opened.", "error");
  }
}

document.addEventListener("submit", async function (event) {
  if (event.target.id !== "updateTransactionForm") return;

  event.preventDefault();

  const submit = event.target.querySelector('button[type="submit"]');
  const uid = document.getElementById("updateUid").value;
  const url = window.transactionLogsConfig.updateUrl.replace("00000000-0000-0000-0000-000000000000", uid);

  const payload = {
    action: document.getElementById("updateAction").value,
    transaction_status: document.getElementById("updateStatus").value,
    transaction_type: document.getElementById("updateTransactionType").value,
    details: document.getElementById("updateDetails").value,
    remarks: document.getElementById("updateRemarks").value,
  };

  if (submit) {
    submit.disabled = true;
    submit.textContent = "Saving…";
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Update failed.");

    closeModal("updateTransactionModal");
    showToast("Transaction updated.", "success");
    loadTransactionLogs();
  } catch (error) {
    console.error(error);
    showToast(error.message || "The update did not save.", "error");
  } finally {
    if (submit) {
      submit.disabled = false;
      submit.textContent = "Save changes";
    }
  }
});

// =====================================================
// DELETE
// =====================================================

function openDeleteModal(uid) {
  closeRowMenus();

  document.getElementById("deleteUid").value = uid;

  const log = lastLogs.find(function (item) {
    return item.uid === uid;
  });

  setText("deleteContext", log ? `${log.client || "Unknown client"} · Queue ${log.queue_no || "—"}` : "");

  openModal("deleteTransactionModal");
}

async function deleteTransaction() {
  const uid = document.getElementById("deleteUid").value;
  const url = window.transactionLogsConfig.deleteUrl.replace("00000000-0000-0000-0000-000000000000", uid);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "X-CSRFToken": getCsrfToken(), "X-Requested-With": "XMLHttpRequest" },
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Delete failed.");

    closeModal("deleteTransactionModal");
    showToast("Transaction log deleted.", "success");
    loadTransactionLogs();
  } catch (error) {
    console.error(error);
    showToast(error.message || "The log was not deleted.", "error");
  }
}

// =====================================================
// EXPORT (current page)
// =====================================================

async function exportCurrentPage() {
  const dateFrom = document.getElementById("dateFrom")?.value || "";
  const dateTo = document.getElementById("dateTo")?.value || "";
  const search = document.getElementById("logSearch")?.value || "";
  const status = document.getElementById("statusFilter")?.value || "";

  try {
    let logsToExport = [];

    // =====================================================
    // NO DATE FILTER = EXPORT ALL TRANSACTIONS
    // =====================================================
    if (!dateFrom && !dateTo) {
      let page = 1;
      let totalPages = 1;

      do {
        const params = new URLSearchParams({
          page: page,
          search: search,
          status: status,
          date_from: "",
          date_to: "",
        });

        const response = await fetch(`${window.transactionLogsConfig.apiUrl}?${params.toString()}`, {
          method: "GET",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load transactions for export.");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error("Unable to load transactions for export.");
        }

        logsToExport.push(...(data.logs || []));

        totalPages = data.pagination?.total_pages || 1;
        page++;
      } while (page <= totalPages);
    }

    // =====================================================
    // WITH DATE FILTER = EXPORT FILTERED TRANSACTIONS
    // =====================================================
    else {
      let page = 1;
      let totalPages = 1;

      do {
        const params = new URLSearchParams({
          page: page,
          search: search,
          status: status,
          date_from: dateFrom,
          date_to: dateTo,
        });

        const response = await fetch(`${window.transactionLogsConfig.apiUrl}?${params.toString()}`, {
          method: "GET",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load filtered transactions.");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error("Unable to load filtered transactions.");
        }

        logsToExport.push(...(data.logs || []));

        totalPages = data.pagination?.total_pages || 1;
        page++;
      } while (page <= totalPages);
    }

    // =====================================================
    // NOTHING TO EXPORT
    // =====================================================
    if (!logsToExport.length) {
      showToast("There are no transactions to export.", "error");
      return;
    }

    // =====================================================
    // CSV HEADERS
    // =====================================================
    const headers = ["Queue", "Client", "Transaction", "Action", "Status", "Forwarded to", "Process Owner", "Logged"];

    // =====================================================
    // CSV ROWS
    // =====================================================
    const rows = logsToExport.map(function (log) {
      return [log.queue_no, log.client, log.transaction_type, log.action, log.transaction_status, log.process_owner, log.forwarded_to, log.survey_form, log.created_at].map(function (value) {
        return `"${String(value ?? "").replace(/"/g, '""')}"`;
      });
    });

    // =====================================================
    // CREATE CSV
    // =====================================================
    const csv = [
      headers.join(","),
      ...rows.map(function (row) {
        return row.join(",");
      }),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;

    // =====================================================
    // FILE NAME
    // =====================================================
    if (!dateFrom && !dateTo) {
      link.download = "all-transaction-logs.csv";
    } else {
      link.download = `transaction-logs-${dateFrom || "start"}-to-${dateTo || "end"}.csv`;
    }

    link.click();

    URL.revokeObjectURL(url);

    showToast(`${logsToExport.length} transaction(s) exported successfully.`, "success");
  } catch (error) {
    console.error("Export error:", error);
    showToast(error.message || "The transactions could not be exported.", "error");
  }
}

// =====================================================
// WEBSOCKET
// =====================================================

function connectTransactionWebSocket() {
  transactionSocket = new WebSocket(window.transactionLogsConfig.websocketUrl);

  transactionSocket.onopen = function () {
    updateWebSocketStatus(true);
  };

  transactionSocket.onmessage = function (event) {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "transaction_refresh") loadTransactionLogs();
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  };

  transactionSocket.onclose = function () {
    updateWebSocketStatus(false);
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
      <span class="relative flex h-2 w-2">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
      </span>
      Live`;
    status.className = "inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300";
  } else {
    status.innerHTML = `<span class="h-2 w-2 rounded-full bg-red-500"></span> Reconnecting…`;
    status.className = "inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }
}

// =====================================================
// MODAL
// =====================================================

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  lastFocused = document.activeElement;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("overflow-hidden");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overflow-hidden");

  if (lastFocused) lastFocused.focus();
}

// =====================================================
// TOAST
// =====================================================

function showToast(message, type = "success") {
  const toast = document.getElementById("transactionToast");
  if (!toast) return;

  const success = type === "success";

  toast.innerHTML = `
    <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
      success ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
    }">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="${success ? "M5 13l4 4L19 7" : "M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"}" />
      </svg>
    </span>
    <span class="text-gray-700 dark:text-gray-200">${escapeHtml(message)}</span>`;

  toast.className = "fixed right-5 top-5 z-[100] flex w-full max-w-xs items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800";

  setTimeout(function () {
    toast.classList.add("hidden");
    toast.classList.remove("flex");
  }, 3500);
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
  if (value === null || value === undefined) return "";

  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
