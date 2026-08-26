let allClient = [];
let filteredClients = [];
let pageSize = 10;
let currentPage = 1;
let searchTerm = "";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

const CSRF_TOKEN = getCookie("csrftoken");

const CURRENT_UNIT_ID = window.CURRENT_USER_UNIT_ID || null;
const CURRENT_ROLE = window.CURRENT_USER_ROLE || "";
const IS_SUPER_ADMIN = CURRENT_ROLE === "SUPER_ADMIN";
const IS_SUB_ADMIN = CURRENT_ROLE === "SUB_ADMIN";
const IS_STAFF = CURRENT_ROLE === "STAFF";

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

/* =====================================================
   SUMMARY STATS
===================================================== */

function updateSummaryStats() {
  // =====================================================
  // TOTAL CLIENTS
  // =====================================================

  const total = allClient.length;

  let waiting = 0;

  // =====================================================
  // SUPER ADMIN + SUB ADMIN
  // Waiting = ALL WAITING CLIENTS
  // =====================================================

  if (IS_SUPER_ADMIN || IS_SUB_ADMIN) {
    waiting = allClient.filter((client) => {
      const status = String(client.status || "Waiting")
        .trim()
        .toLowerCase();

      return status === "waiting";
    }).length;
  }

  // =====================================================
  // STAFF
  // Waiting = FORWARDED TO THEIR UNIT
  // =====================================================
  else if (IS_STAFF) {
    const myUnitName = String(CURRENT_UNIT_ID || "")
      .trim()
      .toLowerCase();

    waiting = allTransaction.filter((transaction) => {
      const status = String(transaction.status || "")
        .trim()
        .toLowerCase();

      const transactionUnit = String(transaction.unit || "")
        .trim()
        .toLowerCase();

      return status === "forwarded" && transactionUnit === myUnitName;
    }).length;
  }

  // =====================================================
  // PRIORITY
  // =====================================================

  const priority = allClient.filter((client) => {
    return (
      String(client.lane || "")
        .trim()
        .toLowerCase() === "priority"
    );
  }).length;

  // =====================================================
  // UPDATE HTML
  // =====================================================

  const totalEl = document.getElementById("statTotalClients");
  const waitingEl = document.getElementById("statWaiting");
  const priorityEl = document.getElementById("statPriority");
  const statusEl = document.getElementById("statStatus");

  if (totalEl) {
    totalEl.textContent = total;
  }

  if (waitingEl) {
    waitingEl.textContent = waiting;
  }

  if (priorityEl) {
    priorityEl.textContent = priority;
  }

  if (statusEl) {
    statusEl.textContent = total ? "Active" : "Idle";
  }

  console.log("📊 SUMMARY STATS");
  console.log("👤 Role:", CURRENT_ROLE);
  console.log("🏢 Unit:", CURRENT_UNIT_ID);
  console.log("⏳ Waiting:", waiting);
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

  if (status === "Serving" || status === "Served") {
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
function filterClients() {
  const term = String(searchTerm || "")
    .trim()
    .toLowerCase();

  // EMPTY SEARCH = SHOW ALL CLIENTS
  if (term === "") {
    filteredClients = [...allClient];
  } else {
    filteredClients = allClient.filter((client) => {
      const transaction = allTransaction.find(
        (t) => Number(t.client_id) === Number(client.id),
      );

      const searchableText = [
        client.queue_no,
        client.queue_code,
        client.full_name,
        client.first_name,
        client.last_name,
        client.lane,
        client.status,
        transaction?.type,
        transaction?.unit,
        transaction?.division,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  }

  // Always go back to page 1 after searching
  currentPage = 1;

  renderClientTable();
}

function handleClientSearch(value) {
  searchTerm = value;
  filterClients();
}

function changePage(page) {
  const totalPages = Math.ceil(filteredClients.length / pageSize);

  if (page < 1 || page > totalPages) {
    return;
  }

  currentPage = page;

  renderClientTable();
}

function renderPagination() {
  const pagination = document.getElementById("clientPagination");

  if (!pagination) return;

  const totalItems = filteredClients.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // No pagination if 10 or fewer
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  let pageButtons = "";

  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentPage;

    pageButtons += `
      <li>
        <button
          type="button"
          onclick="changePage(${i})"
          aria-current="${isActive ? "page" : "false"}"
          class="
            flex h-8 items-center justify-center border
            border-gray-300 px-3 leading-tight
            ${
              isActive
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            }
          "
        >
          ${i}
        </button>
      </li>
    `;
  }

  pagination.innerHTML = `
    <nav
      class="flex flex-col items-center justify-between gap-4 md:flex-row"
      aria-label="Table navigation"
    >
      <!-- Showing -->
      <span
        class="text-sm font-normal text-gray-500 dark:text-gray-400"
      >
        Showing
 
        <span
          class="font-semibold text-gray-900 dark:text-white"
        >
          ${start}-${end}
        </span>
 
        of
 
        <span
          class="font-semibold text-gray-900 dark:text-white"
        >
          ${totalItems}
        </span>
      </span>
 
 
      <!-- Pagination -->
      <ul
        class="inline-flex h-8 -space-x-px text-sm"
      >
 
        <!-- PREVIOUS -->
        <li>
          <button
            type="button"
            onclick="changePage(${currentPage - 1})"
            ${currentPage === 1 ? "disabled" : ""}
            class="
              ms-0 flex h-8 items-center justify-center
              rounded-s-lg border border-gray-300
              bg-white px-3 leading-tight
              ${
                currentPage === 1
                  ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }
              dark:border-gray-700
              dark:bg-gray-800
              dark:hover:bg-gray-700
              dark:hover:text-white
            "
          >
            Previous
          </button>
        </li>
 
 
        <!-- PAGE NUMBERS -->
        ${pageButtons}
 
 
        <!-- NEXT -->
        <li>
          <button
            type="button"
            onclick="changePage(${currentPage + 1})"
            ${currentPage === totalPages ? "disabled" : ""}
            class="
              flex h-8 items-center justify-center
              rounded-e-lg border border-gray-300
              bg-white px-3 leading-tight
              ${
                currentPage === totalPages
                  ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }
              dark:border-gray-700
              dark:bg-gray-800
              dark:hover:bg-gray-700
              dark:hover:text-white
            "
          >
            Next
          </button>
        </li>
 
      </ul>
 
    </nav>
  `;
}

/* =====================================================
   RENDER CLIENT TABLE
===================================================== */

function renderClientTable() {
  const tbody = document.getElementById("clientTablebody");

  if (!tbody) return;

  /*
   * If filteredClients is empty/not initialized,
   * use all clients.
   */
  if (!Array.isArray(filteredClients)) {
    filteredClients = [...allClient];
  }

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * pageSize;

  const pageItems = filteredClients.slice(startIndex, startIndex + pageSize);

  /*
   * No results
   */
  if (!pageItems.length) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="7"
          class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          ${
            searchTerm
              ? `No client found for "${searchTerm}".`
              : "No registered client yet. When the kiosk registers a client, it will appear here automatically."
          }
        </td>
      </tr>
    `;

    updateSummaryStats();
    renderPagination();
    return;
  }

  /*
   * Render table
   */
  tbody.innerHTML = pageItems
    .map((client) => {
      const transaction = allTransaction.find(
        (t) => Number(t.client_id) === Number(client.id),
      );

      return `
        <tr
          data-id="${client.id}"
          class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >

          <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white">
            ${client.queue_no ?? "---"}
          </td>

          <td class="px-4 py-3">
            <div class="flex items-center gap-3">

              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                ${initials(client.full_name)}
              </span>

              <div class="min-w-0">
                <p
                  class="truncate text-sm font-medium text-gray-900 dark:text-white"
                >
                  ${client.full_name || "Unknown Client"}
                </p>

                <p
                  class="truncate text-xs text-gray-500 dark:text-gray-400"
                >
                  ${transaction?.type || "New Application"}
                </p>
              </div>

            </div>
          </td>

          <td class="px-4 py-3">

            <span
              class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
              ${
                client.lane === "Priority"
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }"
            >
              ${client.lane || "Regular"}
            </span>

          </td>

          <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
            ${transaction?.type || "---"}
          </td>

          <td class="px-4 py-3">
            ${statusBadge(client.status || "Waiting")}
          </td>

          <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
            ${transaction?.unit || "---"}
          </td>

          <td class="px-4 py-3">

            <div class="flex items-center justify-center gap-1.5">
              ${buildActionButtons(client, transaction)}
            </div>

          </td>

        </tr>
      `;
    })
    .join("");

  updateSummaryStats();
  renderPagination();
}

/* =====================================================
   ACTION BUTTON ICONS
===================================================== */

const ACTION_ICONS = {
  view: '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  edit: '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/><circle cx="12" cy="12" r="2.25"/></svg>',
  serving:
    '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m8.032 12 1.984 1.984 4.96-4.96m4.55 5.272.893-.893a1.984 1.984 0 0 0 0-2.806l-.893-.893a1.984 1.984 0 0 1-.581-1.403V7.04a1.984 1.984 0 0 0-1.984-1.984h-1.262a1.983 1.983 0 0 1-1.403-.581l-.893-.893a1.984 1.984 0 0 0-2.806 0l-.893.893a1.984 1.984 0 0 1-1.403.581H7.04A1.984 1.984 0 0 0 5.055 7.04v1.262c0 .527-.209 1.031-.581 1.403l-.893.893a1.984 1.984 0 0 0 0 2.806l.893.893c.372.372.581.876.581 1.403v1.262a1.984 1.984 0 0 0 1.984 1.984h1.262c.527 0 1.031.209 1.403.581l.893.893a1.984 1.984 0 0 0 2.806 0l.893-.893a1.985 1.985 0 0 1 1.403-.581h1.262a1.984 1.984 0 0 0 1.984-1.984V15.7c0-.527.209-1.031.581-1.403Z"/></svg>',
  serve:
    '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',
  forward:
    '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4.248 19C3.22 15.77 5.275 8.232 12.466 8.232V6.079a1.025 1.025 0 0 1 1.644-.862l5.479 4.307a1.108 1.108 0 0 1 0 1.723l-5.48 4.307a1.026 1.026 0 0 1-1.643-.861v-2.154C5.275 13.616 4.248 19 4.248 19Z"/></svg>',
  repeat:
    '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>',
  skip: '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16 12h4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>',
};

const ACTION_STYLES = {
  view: "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300",
  edit: "hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-300",
  serve:
    "hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-300",
  serving:
    "hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-300",
  forward:
    "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-300",
  repeat:
    "hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300",
  skip: "hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300",
};

const ACTION_HANDLERS = {
  view: (id) => `openViewModal(${id})`,
  edit: (id) => `openEditModal(${id})`,
  serve: (id) => `openServeModal(${id})`,
  serving: (id) => `openServingModal(${id})`,
  forward: (id) => `openForwardModal(${id})`,
  repeat: (id) => `openRepeatModal(${id})`,
  skip: (id) => `openSkipModal(${id})`,
};

const ACTION_LABELS = {
  view: "View",
  edit: "Edit",
  serve: "Serve",
  serving: "Serving",
  forward: "Forward",
  repeat: "Repeat / Route again",
  skip: "Skip",
};

function actionBtn(type, clientId) {
  return `<button type="button" title="${ACTION_LABELS[type]}" onclick="${ACTION_HANDLERS[type](clientId)}"
      class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition ${ACTION_STYLES[type]}">${ACTION_ICONS[type]}</button>`;
}

/* =====================================================
   ROLE + STATUS AWARE ACTION BUTTONS
   See the ROLE-BASED ACCESS block above for the exact matrix.
===================================================== */

function buildActionButtons(client, transaction) {
  const status = transaction?.status || "Waiting";
  console.log(status);
  const buttons = []; // View is always visible, all roles, all statuses

  if (IS_SUPER_ADMIN) {
    // Super Admin: every button, every status — no restrictions
    buttons.push(actionBtn("view", client.id));
    buttons.push(actionBtn("edit", client.id));
    buttons.push(actionBtn("serve", client.id));
    buttons.push(actionBtn("serving", client.id));
    buttons.push(actionBtn("forward", client.id));
    buttons.push(actionBtn("repeat", client.id));
    buttons.push(actionBtn("skip", client.id));
    return buttons.join("");
  }

  if (IS_SUB_ADMIN) {
    if (status === "Waiting") {
      buttons.push(actionBtn("view", client.id));
      buttons.push(actionBtn("edit", client.id));
      buttons.push(actionBtn("serve", client.id));
      buttons.push(actionBtn("forward", client.id));
      buttons.push(actionBtn("skip", client.id));
    } else {
      // Once the status has moved on (Serving / Forwarded / Skipped / Approved)
      buttons.push(actionBtn("view", client.id));
      buttons.push(actionBtn("repeat", client.id));
      buttons.push(actionBtn("edit", client.id));
    }
    return buttons.join("");
  }

  if (IS_STAFF) {
    if (status === "Forwarded") {
      buttons.push(actionBtn("serving", transaction?.transaction_id));
      buttons.push(actionBtn("skip", client.id));
    } else if (status === "Serving") {
      buttons.push(actionBtn("serve", transaction?.transaction_id));
      buttons.push(actionBtn("skip", client.id));
    }
    // Any other status (Waiting / Skipped / Approved) -> View only
    return buttons.join("");
  }

  // Unknown/unset role -> View only, safest default
  return buttons.join("");
}

function showModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}
function hideModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

function notify(message) {
  const el = document.getElementById("transactionNotification");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2500);
}

// ---------- View ----------
async function openViewModal(clientId) {
  const transaction = allTransaction.find(
    (t) => Number(t.client_id) === Number(clientId),
  );
  const res = await fetch(`api/client/${clientId}`);
  const data = await res.json();
  if (!data.success) return;

  const c = data.data;
  document.getElementById("viewAvatar").textContent = initials(c.full_name);
  document.getElementById("viewFullName").textContent =
    c.full_name || "Unknown Client";
  document.getElementById("viewContact").textContent =
    c.contact || "No contact";
  document.getElementById("viewQueueNo").textContent = c.queue_no || "---";
  document.getElementById("viewTransaction").textContent =
    transaction?.type || "---";
  document.getElementById("viewGender").textContent = c.gender || "---";
  document.getElementById("viewOffice").textContent = c.organization || "---";
  document.getElementById("viewAddress").textContent = c.address || "---";

  document.getElementById("viewLane").innerHTML =
    `<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${c.lane === "Priority" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}">${c.lane || "Regular"}</span>`;
  document.getElementById("viewStatus").innerHTML = statusBadge(
    c.status || "Waiting",
  );

  // Optional: transaction history, if your get_client API includes it as c.history
  const historySection = document.getElementById("viewHistorySection");
  const historyList = document.getElementById("viewHistoryList");
  if (Array.isArray(c.history) && c.history.length) {
    historyList.innerHTML = c.history
      .map(
        (h) => `
        <li class="ms-4">
          <div class="absolute w-2 h-2 bg-blue-500 rounded-full -start-[4.5px] mt-1.5"></div>
          <p class="text-xs text-gray-400">${h.date || ""}</p>
          <p class="text-sm text-gray-700 dark:text-gray-300">${h.action || ""}${h.detail ? " — " + h.detail : ""}</p>
        </li>`,
      )
      .join("");
    historySection.classList.remove("hidden");
  } else {
    historySection.classList.add("hidden");
  }

  showModal("viewModal");
}

// ---------- Repeat (route an already-forwarded client onward again) ----------
async function openRepeatModal(clientId) {
  await openForwardModal(clientId);
  document.getElementById("forwardModalTitle").textContent =
    "Route to next office";
}

// ---------- Edit ----------
async function openEditModal(clientId) {
  const res = await fetch(`api/client/${clientId}`);
  const data = await res.json();
  if (!data.success) return;

  const _client = data.data;
  document.getElementById("editQueueNo").value = clientId;
  document.getElementById("editFirstName").value = _client.first_name;
  document.getElementById("editLastName").value = _client.last_name;
  document.getElementById("editContact").value = _client.contact;
  document.getElementById("editAddress").value = _client.address;
  if (_client.gender)
    document.getElementById("editGender").value = _client.gender;
  if (_client.lane) document.getElementById("editLane").value = _client.lane;
  if (_client.transaction_type)
    document.getElementById("editTransaction").value = _client.transaction_type;
  showModal("editModal");
}

async function saveEditClient() {
  const clientId = document.getElementById("editQueueNo").value;
  const payload = {
    first_name: document.getElementById("editFirstName").value,
    last_name: document.getElementById("editLastName").value,
    contact: document.getElementById("editContact").value,
    address: document.getElementById("editAddress").value,
    gender: document.getElementById("editGender").value,
    lane: document.getElementById("editLane").value,
    transaction_type: document.getElementById("editTransaction").value,
  };

  try {
    const res = await fetch(`api/client/${clientId}/update/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": CSRF_TOKEN,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Update failed");

    hideModal("editModal");
    notify("Client details updated.");
    loadClients();
  } catch (error) {
    console.error("❌ Save edit error:", error);
    notify("Unable to update client. Please try again.");
  }
}

async function openServingModal(transactionId) {
  const transaction = allTransaction.find(
    (t) => Number(t.transaction_id) === Number(transactionId),
  );

  const clientId = transaction.client_id;

  const res = await fetch(`/api/client/${clientId}`);
  const data = await res.json();

  const _client = data.data;
  ((document.getElementById("servingClientId").value = clientId),
    (document.getElementById("servingTransactionId").value = transactionId),
    (document.getElementById("servingClientFullName").textContent = initials(
      _client.full_name,
    )));
  document.getElementById("servingClientFullName").textContent =
    _client.full_name || "Unknown Client";

  document.getElementById("servingQueueBadge").textContent =
    _client.queue_no || "---";
  document.getElementById("servingLane").innerHTML =
    `<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${_client.lane === "Priority" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}">${_client.lane || "Regular"}</span>`;
  document.getElementById("servingStatus").innerHTML = statusBadge(
    _client.status || "Waiting",
  );
  document.getElementById("servingClientTransaction").textContent =
    transaction?.type || "---";
  document.getElementById("servingGender").textContent =
    _client.gender || "---";
  document.getElementById("servingOrg").textContent =
    _client.organization || "Personal";
  document.getElementById("servingAddress").textContent =
    _client.address || "---";
  document.getElementById("servingDetails").textContent =
    transaction?.details || "---";

  console.log(_client.status);
  showModal("servingModal");
  return;
}

// SERVING fixed
async function saveServingClient() {
  const transactionId = document.getElementById("servingTransactionId").value;
  console.log(transactionId);
  const clientId = document.getElementById("servingClientId").value;
  try {
    const res = await fetch(`api/client/${clientId}/serving/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": CSRF_TOKEN,
      },
      body: JSON.stringify({
        transactionId: transactionId,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Serving failed");

    hideModal("servingModal");
    loadClients();
    notify(data.message || "Client Serving.");
  } catch (error) {
    console.error("❌ Serving error:", error);
    notify("Unable to serving client. Please try again.");
  }
}

async function openForwardModal(clientId) {
  const res = await fetch(`api/client/${clientId}`);
  const data = await res.json();
  if (!data.success) return;

  const _client = data.data;
  document.getElementById("forwardModalTitle").textContent =
    "Forward transaction";
  document.getElementById("forwardQueueNo").value = clientId;
  document.getElementById("forwardQueueBadge").textContent =
    _client.queue_no || "---";
  document.getElementById("forwardClientFullName").textContent =
    _client.full_name;
  document.getElementById("forwardClientTransaction").textContent =
    _client.transaction_type || "New Application";
  document.getElementById("forwardTransactionDetails").value = "";

  resetForwardDropdowns();
  await loadForwardDivisions();

  showModal("forwardModal");
}

function resetForwardDropdowns() {
  const divisionSelect = document.getElementById("forwardDivision");
  const unitSelect = document.getElementById("forwardUnit");
  divisionSelect.innerHTML =
    '<option value="" disabled selected>Loading divisions...</option>';
  unitSelect.innerHTML =
    '<option value="" disabled selected>Select division first</option>';
  unitSelect.disabled = true;
}

async function loadForwardDivisions() {
  const divisionSelect = document.getElementById("forwardDivision");
  try {
    const res = await fetch("api/divisions/");
    const data = await res.json();
    if (!data.success || !data.divisions.length) {
      divisionSelect.innerHTML =
        '<option value="" disabled selected>No divisions available</option>';
      return;
    }
    divisionSelect.innerHTML =
      '<option value="" disabled selected>Select division</option>' +
      data.divisions
        .map((d) => `<option value="${d.id}">${d.name}</option>`)
        .join("");
  } catch (error) {
    console.error("❌ Load divisions error:", error);
    divisionSelect.innerHTML =
      '<option value="" disabled selected>Unable to load divisions</option>';
  }
}

async function onForwardDivisionChange() {
  const divisionId = document.getElementById("forwardDivision").value;
  const unitSelect = document.getElementById("forwardUnit");

  unitSelect.disabled = true;
  unitSelect.innerHTML =
    '<option value="" disabled selected>Loading units...</option>';

  if (!divisionId) {
    unitSelect.innerHTML =
      '<option value="" disabled selected>Select division first</option>';
    return;
  }

  try {
    const res = await fetch(`api/units/?division_id=${divisionId}`);
    const data = await res.json();

    if (!data.success || !data.units.length) {
      unitSelect.innerHTML =
        '<option value="" disabled selected>No units under this division</option>';
      return;
    }

    unitSelect.innerHTML =
      '<option value="" disabled selected>Select unit</option>' +
      data.units
        .map((u) => `<option value="${u.id}">${u.name}</option>`)
        .join("");
    unitSelect.disabled = false;
  } catch (error) {
    console.error("❌ Load units error:", error);
    unitSelect.innerHTML =
      '<option value="" disabled selected>Unable to load units</option>';
  }
}

// fixed nani
async function saveForwardClient() {
  const clientId = document.getElementById("forwardQueueNo").value;
  const divisionId = document.getElementById("forwardDivision").value;
  const unitId = document.getElementById("forwardUnit").value;
  if (!divisionId || !unitId) {
    notify("Please select both a division and a unit.");
    return;
  }

  try {
    const res = await fetch(`api/client/${clientId}/forward/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": CSRF_TOKEN,
      },
      body: JSON.stringify({
        division_id: divisionId,
        unit_id: unitId,
        details: document.getElementById("forwardTransactionDetails").value,
        type: document.getElementById("forwardClientTransactionType").value,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Forward failed");

    hideModal("forwardModal");

    loadClients();
    notify(data.message || "Client forwarded.");
  } catch (error) {
    console.error("❌ Forward error:", error);
    notify("Unable to forward client. Please try again.");
  }
}

async function openServeModal(id) {
  try {
    if (IS_SUB_ADMIN || IS_SUPER_ADMIN) {
      const clientId = id;

      const res = await fetch(`/api/client/${clientId}`);
      const data = await res.json();

      const _client = data.data;

      console.log(_client);
      // resetServeForm();

      document.getElementById("serveClientId").value = clientId;
      document.getElementById("serveClientName").textContent =
        _client.full_name || "---";
      document.getElementById("serveQueueBadge").textContent =
        _client.queue_no || "---";
    }

    if (IS_STAFF) {
      // Find existing transaction
      const transaction = allTransaction.find(
        (t) => Number(t.transaction_id) === Number(id),
      );

      console.log("Found transaction:", transaction);

      if (!transaction) {
        notify("Transaction not found.");
        return;
      }

      const clientId = transaction.client_id;

      if (!clientId) {
        notify("Client ID not found in transaction.");
        return;
      }

      // Get client information
      const res = await fetch(`/api/client/${clientId}`);
      const data = await res.json();

      if (!data.success) {
        notify("Unable to load client.");
        return;
      }

      const _client = data.data;
      document.getElementById("serveTransactionId").value =
        transaction?.transaction_id;
      document.getElementById("serveClientId").value = clientId;
      document.getElementById("serveQueueBadge").textContent =
        _client.queue_no || "---";
      document.getElementById("serveClientName").textContent =
        _client.full_name || "---";
      document.getElementById("serveClientTransaction").textContent =
        transaction.type || "---";
    }
    resetServeForm();
    await loadAvailableServices();
    showModal("serveModal");
    return;
  } catch (error) {
    console.error("❌ Open serve transaction error:", error);
    notify("Unable to open serve transaction.");
  }
}

/* =====================================================
   SERVE MODAL — CONDITIONAL FLOW
   Citizen's Charter -> Services -> Deficiencies -> Resolved -> CSM / CSS
===================================================== */

function resetServeForm() {
  document.getElementById("serveForm").reset();
  [
    "serveServiceSection",
    "serveDeficiencyQuestion",
    "serveDeficiencyDetailsSection",
    "serveResolvedQuestion",
    "serveRemarksSection",
    "serveTypeSelection",
    "serveButton",
    "CSMForm",
    "CSSForm",
  ].forEach((id) => {
    document.getElementById(id).classList.add("hidden");
  });
}

function updateServeFlow() {
  const charter = document.querySelector(
    'input[name="serveCharter"]:checked',
  )?.value;
  const service = document.getElementById("serveService").value;
  //quest sa kung naa deficiency
  const deficiency = document.querySelector(
    'input[name="serveDeficiency"]:checked',
  )?.value;
  //Was the transaction catered / resolved?
  const resolved = document.querySelector(
    'input[name="serveResolved"]:checked',
  )?.value;
  const serviceSection = document.getElementById("serveServiceSection");
  const deficiencyQuestion = document.getElementById("serveDeficiencyQuestion");
  const deficiencyDetails = document.getElementById(
    "serveDeficiencyDetailsSection",
  );
  const type = document.getElementById("serveClientTransaction").value;
  const isService = document.getElementById("serveService").value;
  const resolvedQuestion = document.getElementById("serveResolvedQuestion");
  const remarks = document.getElementById("serveRemarksSection");
  const csmSection = document.getElementById("serveCSMSection");
  const serveBtn = document.getElementById("serveButton");
  const csm = document.getElementById("CSMForm");
  const css = document.getElementById("CSSForm");
  const form = document.querySelector('input[name="serveForm"]:checked')?.value;
  const typeSelection = document.getElementById("serveTypeSelection");

  if (charter === "Yes") {
    typeSelection.classList.remove("hidden");
    serveBtn.classList.remove("hidden");
    serviceSection.classList.remove("hidden");
    if (isService) {
      deficiencyQuestion.classList.remove("hidden");
      if (deficiency === "Yes") {
        deficiencyDetails.classList.remove("hidden");
        resolvedQuestion.classList.add("hidden");
        csm.classList.add("hidden");
        css.classList.remove("hidden");
        if (form) {
          serveBtn.classList.remove("hidden");
        }
      } else if (deficiency === "No") {
        deficiencyDetails.classList.add("hidden");
        deficiencyDetails.classList.add("hidden");
        resolvedQuestion.classList.add("hidden");
        csm.classList.remove("hidden");
        css.classList.add("hidden");
        // serveBtn.classList.remove("hidden");
      }
    }
  } else if (charter === "No") {
    isService == "";
    serviceSection.classList.add("hidden");
    deficiencyQuestion.classList.add("hidden");
    resolvedQuestion.classList.remove("hidden");
    deficiencyDetails.classList.add("hidden");
    csm.classList.add("hidden");
    if (resolved === "Yes" || resolved === "No") {
      remarks.classList.remove("hidden");
      css.classList.remove("hidden");
      if (form) {
        serveBtn.classList.remove("hidden");
      }
    }
  }
}

async function saveServeClient() {
  const clientId = document.getElementById("serveClientId").value;
  const transactionId = document.getElementById("serveTransactionId").value;
  const details = document.getElementById("serveDetails").value;
  const type = document.getElementById("serveTransactionType").value;
  const remarks = document.getElementById("serveRemarks").value;
  const charter =
    document.querySelector('input[name="serveCharter"]:checked')?.value || null;
  const service = document.getElementById("serveService")?.value || null;
  const deficiency =
    document.querySelector('input[name="serveDeficiency"]:checked')?.value ||
    null;
  const deficiencyDetails = document.getElementById(
    "serveDeficiencyDetails",
  ).value;
  const resolved =
    document.querySelector('input[name="serveResolved"]:checked')?.value ||
    null;
  const surveyForm =
    document.querySelector('input[name="serveForm"]:checked')?.value || null;
  console.log(clientId);

  try {
    const res = await fetch(`api/client/${clientId}/serve/`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-Request-With": "XMLHttpRequest",
        "X-CSRFToken": CSRF_TOKEN,
      },
      body: JSON.stringify({
        transactionId: transactionId,
        type: type,
        details: details,
        remarks: remarks,
        charter: charter,
        service: service,
        deficiency: deficiency,
        deficiencyDetails: deficiencyDetails,
        resolved: resolved,
        form: surveyForm,
      }),
    });
    hideModal("serveModal");
    loadClients();
  } catch (error) {
    notify("Unable to serve client. Please try again.");
  }
}

// ------- SERVICES
async function loadAvailableServices() {
  const serviceSelect = document.getElementById("serveService");

  if (!serviceSelect) return;

  try {
    serviceSelect.innerHTML = `
      <option value="" selected disabled>
        Loading services...
      </option>
    `;

    const res = await fetch("api/services/available/");

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Unable to load services");
    }

    serviceSelect.innerHTML = `
      <option value="" selected disabled>
        Select service
      </option>
    `;

    data.services.forEach((service) => {
      const option = document.createElement("option");

      // Database ID
      option.value = service.id;

      // Display name
      option.textContent = service.name;

      serviceSelect.appendChild(option);
    });
  } catch (error) {
    console.error("❌ Load services error:", error);

    serviceSelect.innerHTML = `
      <option value="" selected disabled>
        Unable to load services
      </option>
    `;
  }
}

// ---------- Skip ----------
function openSkipModal(clientId) {
  document.getElementById("skipQueueNo").value = clientId;
  showModal("skipModal");
}

async function confirmSkipClient() {
  const clientId = document.getElementById("skipQueueNo").value;

  try {
    const res = await fetch(`api/client/${clientId}/skip/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": CSRF_TOKEN,
      },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Skip failed");

    hideModal("skipModal");
    notify("Client marked as skipped.");
    loadClients();
  } catch (error) {
    console.error("❌ Skip error:", error);
    hideModal("skipModal");
    notify("Unable to skip client. Please try again.");
  }
}

/* =====================================================
   REST API
   LOAD EXISTING CLIENTS
===================================================== */

async function loadClients() {
  try {
    const response = await fetch("api/clients-list", {
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

    allTransaction = Array.isArray(data.transactions) ? data.transactions : [];
    updateNotificationBell();

    // IMPORTANT
    filteredClients = [...allClient];

    currentPage = 1;
    searchTerm = "";

    const searchInput = document.getElementById("clientSearch");
    if (searchInput) {
      searchInput.value = "";
    }

    renderClientTable();

    console.log("✅ Clients:", allClient);
    console.log("✅ Transactions:", allTransaction);
  } catch (error) {
    console.error("❌ REST API error:", error);

    const tbody = document.getElementById("clientTablebody");

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td
            colspan="7"
            class="px-4 py-8 text-center text-sm text-red-500"
          >
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

/* =====================================================
   NAVBAR NOTIFICATION
===================================================== */

/* =====================================================
   NAVBAR NOTIFICATION
===================================================== */

function updateNotificationBell() {
  const badge = document.getElementById("notify");

  if (!badge) return;

  let notificationCount = 0;

  // =====================================================
  // SUPER ADMIN + SUB ADMIN
  // COUNT ALL WAITING CLIENTS
  // =====================================================

  if (IS_SUPER_ADMIN || IS_SUB_ADMIN) {
    notificationCount = allClient.filter((client) => {
      return (
        String(client.status || "")
          .trim()
          .toLowerCase() === "waiting"
      );
    }).length;
  }

  // =====================================================
  // STAFF
  // COUNT FORWARDED CLIENTS FOR THEIR UNIT ONLY
  // =====================================================
  else if (IS_STAFF) {
    notificationCount = allTransaction.filter((transaction) => {
      const status = String(transaction.status || "")
        .trim()
        .toLowerCase();

      const transactionUnit = String(transaction.unit || "")
        .trim()
        .toLowerCase();

      const myUnit = String(window.CURRENT_USER_UNIT_ID || "")
        .trim()
        .toLowerCase();

      console.log("STAFF NOTIFICATION CHECK:", {
        status,
        transactionUnit,
        myUnit,
      });

      return status === "forwarded" && transactionUnit === myUnit;
    }).length;
  }

  // =====================================================
  // UPDATE BELL
  // =====================================================

  if (notificationCount > 0) {
    badge.textContent = String(notificationCount);

    badge.style.display = "inline-flex";
  } else {
    badge.textContent = "0";

    badge.style.display = "none";
  }

  console.log("🔔 Notification count:", notificationCount);
}

/* =====================================================
   NOTIFICATION TOAST
===================================================== */

function showNotificationToast(message) {
  const toast = document.getElementById("transactionNotification");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
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

  socket.onmessage = async function (event) {
    console.log("📡 WebSocket received:", event.data);

    try {
      const payload = JSON.parse(event.data);

      console.log("📦 Parsed payload:", payload);

      // =====================================================
      // EVENTS THAT SHOULD REFRESH THE DASHBOARD
      // =====================================================

      const refreshEvents = [
        "CLIENT_REGISTERED",
        "QUEUE_UPDATED",
        "CLIENT_FORWARDED",
        "CLIENT_SERVED",
        "CLIENT_SKIPPED",
        "CLIENT_UPDATED",
        "TRANSACTION_UPDATED",
      ];

      // If this event is not related to queue changes
      if (!refreshEvents.includes(payload.event)) {
        console.log("ℹ️ Ignored event:", payload.event);

        return;
      }

      // =====================================================
      // RELOAD CLIENTS
      // =====================================================

      console.log("🔄 Queue changed. Reloading clients...");

      await loadClients();

      // =====================================================
      // SUPER ADMIN / SUB ADMIN
      // NEW WAITING CLIENT
      // =====================================================

      if (
        payload.event === "CLIENT_REGISTERED" &&
        (IS_SUPER_ADMIN || IS_SUB_ADMIN)
      ) {
        const client = payload.client;

        if (client) {
          showNotificationToast(
            `Bag-ong waiting client: ${client.full_name || "New client"}`,
          );
        }
      }

      // =====================================================
      // STAFF
      // FORWARDED TO THEIR UNIT
      // =====================================================

      if (IS_STAFF) {
        if (payload.event === "CLIENT_FORWARDED") {
          const forwardedUnitId = Number(payload.transaction?.unit_id);

          const myUnitId = Number(CURRENT_UNIT_ID);

          // COUNT ONLY IF FORWARDED TO MY UNIT
          if (forwardedUnitId === myUnitId) {
            notifyNavbarBell(
              payload.client?.full_name,
              `Na-forward ang ${payload.client?.queue_no} ngadto sa inyong unit.`,
            );
          }
        }
      }

      // =====================================================
      // BELL IS ALREADY UPDATED INSIDE loadClients()
      // =====================================================

      console.log("🔔 Notification count synchronized.");
    } catch (error) {
      console.error("❌ WebSocket JSON error:", error);
    }
  };

  socket.onerror = function (error) {
    console.error("❌ WebSocket error:", error);
  };

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
  loadClients();
  connectQueueSocket();
  updateSummaryStats();
})();
