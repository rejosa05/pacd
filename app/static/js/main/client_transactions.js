let allClient = [];
let pageSize = 10;
let currentPage = 1;

/* =====================================================
   CSRF TOKEN (required by Django for POST/PUT/DELETE)
===================================================== */

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

const CSRF_TOKEN = getCookie("csrftoken");

/* =====================================================
   ROLE-BASED ACCESS
   Matches the strings used in @role_required("SUPER_ADMIN", "SUB_ADMIN", "STAFF")

   SUPER_ADMIN — sees every button, on every status, no restrictions.

   SUB_ADMIN — initial interview:
     status = Waiting   -> View, Serve, Forward, Skip, Edit
     any other status   -> View, Repeat, Edit  (once acted on, only these remain)

   STAFF — handles what was forwarded to them:
     status = Forwarded or Serving -> View, Serve, Skip
     any other status              -> View only
===================================================== */

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
    .map((client) => {
      const transaction = allTransaction.find(
        (t) => Number(t.client_id) === Number(client.id),
      );
      return `
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
              <td class="px-4 py-3 text-gray-700 dark:text-gray-300">${transaction?.type || "---"}</td>
              <td class="px-4 py-3">${statusBadge(client.status || transaction?.status)}</td>
              <td class="px-4 py-3 text-gray-700 dark:text-gray-300">${transaction?.unit || "---"}</td>
              <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-1.5">
                      ${buildActionButtons(client, transaction?.transaction_id)}
                  </div>
              </td>
          </tr>
      `;
    })
    .join("");

  updateSummaryStats();
}

/* =====================================================
   ACTION BUTTON ICONS
===================================================== */

const ACTION_ICONS = {
  view: '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  edit: '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/><circle cx="12" cy="12" r="2.25"/></svg>',
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
  forward: (id) => `openForwardModal(${id})`,
  repeat: (id) => `openRepeatModal(${id})`,
  skip: (id) => `openSkipModal(${id})`,
};

const ACTION_LABELS = {
  view: "View",
  edit: "Edit",
  serve: "Serve",
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

function buildActionButtons(client, transaction_id) {
  const status = client.status || "Waiting";
  const buttons = [actionBtn("view", client.id)]; // View is always visible, all roles, all statuses

  if (IS_SUPER_ADMIN) {
    // Super Admin: every button, every status — no restrictions
    buttons.push(actionBtn("edit", client.id));
    buttons.push(actionBtn("serve", client.id));
    buttons.push(actionBtn("forward", client.id));
    buttons.push(actionBtn("repeat", client.id));
    buttons.push(actionBtn("skip", client.id));
    return buttons.join("");
  }

  if (IS_SUB_ADMIN) {
    if (status === "Waiting") {
      buttons.push(actionBtn("edit", client.id));
      buttons.push(actionBtn("serve", client.id));
      buttons.push(actionBtn("forward", client.id));
      buttons.push(actionBtn("skip", client.id));
    } else {
      // Once the status has moved on (Serving / Forwarded / Skipped / Approved)
      buttons.push(actionBtn("repeat", client.id));
      buttons.push(actionBtn("edit", client.id));
    }
    return buttons.join("");
  }

  if (IS_STAFF) {
    if (status === "Forwarded" || status === "Serving") {
      buttons.push(actionBtn("serve", transaction_id));
      buttons.push(actionBtn("skip", client.id));
    }
    // Any other status (Waiting / Skipped / Approved) -> View only
    return buttons.join("");
  }

  // Unknown/unset role -> View only, safest default
  return buttons.join("");
}

// ---------- Modal helpers ----------
// NOTE: these modals are shown/hidden purely with the "hidden" class.
// We intentionally do NOT use Flowbite's data-modal-toggle/data-modal-hide
// system here, because those modals were never registered as Flowbite
// instances (they weren't opened via data-modal-target). Mixing the two
// causes: "Flowbite: Instance with ID ... does not exist." in the console.
// All open/close calls go through these two functions instead.
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
    c.transaction_type || "---";
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
    notify(data.message || "Client forwarded.");
    loadClients();
  } catch (error) {
    console.error("❌ Forward error:", error);
    notify("Unable to forward client. Please try again.");
  }
}

async function openServeModal(transactionId) {
  console.log("Transaction ID:", transactionId);

  try {
    if (IS_STAFF) {
      // Find existing transaction
      const transaction = allTransaction.find(
        (t) => Number(t.transaction_id) === Number(transactionId),
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

      resetServeForm();
      document.getElementById("serveTransactionId").value =
        transaction?.transaction_id;

      // // Store client ID
      document.getElementById("serveClientId").value = clientId;

      // // Display client
      document.getElementById("serveClientName").textContent =
        _client.full_name || "---";

      // // Display transaction
      document.getElementById("serveClientTransaction").textContent =
        transaction.type || "---";

      await loadAvailableServices();
      showModal("serveModal");
      return;
    }
  } catch (error) {
    console.error("❌ Open serve transaction error:", error);
    notify("Unable to open serve transaction.");
  }
}

// try {
//   let clientId;
//   let transaction = null;

//   if (IS_SUB_ADMIN || IS_SUPER_ADMIN) {
//     clientId = id;

//     const res = await fetch(`api/client/${clientId}`);
//     const data = await res.json();

//     if (!data.success) {
//       notify("Unable to load client.");
//       return;
//     }

//     const _client = data.data;

//     // Reset first
//     resetServeForm();
//     document.getElementById("serveQueueNo").value = clientId;
//     document.getElementById("serveQueueBadge").textContent =
//       _client.queue_no || "---";

//     document.getElementById("serveClientName").textContent =
//       _client.full_name || "---";

//     document.getElementById("serveClientTransaction").textContent = "---";

//     document
//       .getElementById("serveTransactionTypeSection")
//       .classList.remove("hidden");

//     document.getElementById("serveServiceSection").classList.add("hidden");

//     await loadAvailableServices();

//     showModal("serveModal");

//     return;
//   }

//   if (IS_STAFF) {
//     const transactionId = id;

//     transaction = allTransaction.find(
//       (t) => Number(t.id) === Number(transactionId),
//     );

//     if (!transaction) {
//       notify("Transaction not found.");
//       return;
//     }

//     clientId = transaction.client_id;

//     const res = await fetch(`api/client/${clientId}`);
//     const data = await res.json();

//     if (!data.success) {
//       notify("Unable to load client.");
//       return;
//     }

//     const _client = data.data;

//     // Reset first
//     resetServeForm();

//     // Store TRANSACTION ID
//     document.getElementById("serveTransactionId").value = transaction.id;

//     // Store CLIENT ID
//     document.getElementById("serveQueueNo").value = clientId;

//     // Client information
//     document.getElementById("serveQueueBadge").textContent =
//       _client.queue_no || "---";

//     document.getElementById("serveClientName").textContent =
//       _client.full_name || "---";

//     // Existing transaction type
//     document.getElementById("serveClientTransaction").textContent =
//       transaction.type || "---";

//     // Hide transaction type selection
//     document
//       .getElementById("serveTransactionTypeSection")
//       .classList.add("hidden");

//     // IMPORTANT:
//     // Staff should see the service section
//     document.getElementById("serveServiceSection").classList.add("hidden");

//     // Load services
//   await loadAvailableServices();

//   showModal("serveModal");

//   //     return;
//   //   }

//   //   notify("Invalid user role.");
//   // } catch (error) {
//   //   console.error("❌ Open serve modal error:", error);
//   //   notify("Unable to open serve transaction.");
//   // }
// }

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
    "serveCSMSection",
    "serveCSSSection",
  ].forEach((id) => {
    document.getElementById(id).classList.add("hidden");
  });
}

function updateServeFlow() {
  const charter = document.querySelector(
    'input[name="serveCharter"]:checked',
  )?.value;

  const service = document.getElementById("serveService").value;

  const deficiency = document.querySelector(
    'input[name="serveDeficiency"]:checked',
  )?.value;

  const resolved = document.querySelector(
    'input[name="serveResolved"]:checked',
  )?.value;

  const serviceSection = document.getElementById("serveServiceSection");

  const deficiencyQuestion = document.getElementById("serveDeficiencyQuestion");

  const deficiencyDetails = document.getElementById(
    "serveDeficiencyDetailsSection",
  );

  const resolvedQuestion = document.getElementById("serveResolvedQuestion");

  const csmSection = document.getElementById("serveCSMSection");

  const cssSection = document.getElementById("serveCSSSection");

  // =====================================================
  // STEP 2: SERVICE
  // Only show service selection if Charter = YES
  // =====================================================

  const isCharter = charter === "Yes";

  serviceSection.classList.toggle("hidden", !isCharter);

  // =====================================================
  // STEP 3: SERVICE / DEFICIENCY
  //
  // Charter YES + Service selected
  //     → show deficiency question
  //
  // Charter YES + Service = NO / empty
  //     → skip deficiency
  //
  // Charter NO
  //     → skip service and deficiency
  // =====================================================

  const hasService = charter === "Yes" && !!service;

  deficiencyQuestion.classList.toggle("hidden", !hasService);

  // If there is no service, clear deficiency
  if (!hasService) {
    deficiencyQuestion
      .querySelectorAll('input[name="serveDeficiency"]')
      .forEach((radio) => {
        radio.checked = false;
      });

    deficiencyDetails.classList.add("hidden");
  }

  // =====================================================
  // STEP 4: DEFICIENCY DETAILS
  // Only show if Service exists AND Deficiency = YES
  // =====================================================

  deficiencyDetails.classList.toggle(
    "hidden",
    !(hasService && deficiency === "Yes"),
  );

  // =====================================================
  // STEP 5: RESOLVED
  //
  // Show if:
  //
  // 1. Charter = NO
  // OR
  // 2. Charter = YES but NO service selected
  // OR
  // 3. Charter = YES + service selected
  //    + deficiency answered
  // =====================================================

  const noService = charter === "No" || (charter === "Yes" && !service);

  const deficiencyCompleted = hasService && !!deficiency;

  const showResolved = noService || deficiencyCompleted;

  resolvedQuestion.classList.toggle("hidden", !showResolved);

  // Clear resolved when it should not be visible
  if (!showResolved) {
    resolvedQuestion
      .querySelectorAll('input[name="serveResolved"]')
      .forEach((radio) => {
        radio.checked = false;
      });

    csmSection.classList.add("hidden");
    cssSection.classList.add("hidden");

    return;
  }

  // =====================================================
  // STEP 6: CSM / CSS
  //
  // Resolved = YES
  //     → CSM if service exists
  //     → CSS if NO service
  //
  // Resolved = NO
  //     → CSS
  // =====================================================

  if (resolved === "Yes") {
    if (hasService) {
      // Service exists
      csmSection.classList.remove("hidden");
      cssSection.classList.add("hidden");
    } else {
      // No service
      csmSection.classList.add("hidden");
      cssSection.classList.remove("hidden");
    }
  } else if (resolved === "No") {
    // Not resolved → CSS
    csmSection.classList.add("hidden");
    cssSection.classList.remove("hidden");
  } else {
    // No answer yet
    csmSection.classList.add("hidden");
    cssSection.classList.add("hidden");
  }
}

async function saveServeClient() {
  const clientId = document.getElementById("serveClientId").value;
  const transactionId = document.getElementById("serveTransactionId").value;
  const service = document.getElementById("serveService").value;
  const hasService = !!service;

  const transactionTypeElement = document.getElementById(
    "serveTransactionType",
  );

  const transactionType = transactionTypeElement
    ? transactionTypeElement.value || null
    : null;

  // =====================================================
  // PAYLOAD
  // =====================================================

  const payload = {
    transaction_type: transactionType,

    description: document.getElementById("serveDescription").value || null,

    citizen_charter:
      document.querySelector('input[name="serveCharter"]:checked')?.value ||
      null,

    service: service || null,

    has_deficiency:
      document.querySelector('input[name="serveDeficiency"]:checked')?.value ||
      null,

    deficiency_details:
      document.getElementById("serveDeficiencyDetails").value || null,

    resolved:
      document.querySelector('input[name="serveResolved"]:checked')?.value ||
      null,

    deficiency_status: hasService
      ? document.getElementById("serveDeficiencyStatus")?.value || null
      : null,

    csm_rating: hasService
      ? document.getElementById("serveCSMRating")?.value || null
      : null,

    css_rating: !hasService
      ? document.getElementById("serveCSSRating")?.value || null
      : null,
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  if (!payload.citizen_charter) {
    notify(
      "Please select if the transaction is covered by the Citizen's Charter.",
    );
    return;
  }

  // =====================================================
  // SUB-ADMIN / SUPER ADMIN
  // MUST SELECT TRANSACTION TYPE
  // =====================================================

  if (IS_SUB_ADMIN || IS_SUPER_ADMIN) {
    if (!payload.transaction_type) {
      notify("Please select a transaction type.");
      return;
    }
  }

  // =====================================================
  // SERVICE
  // =====================================================

  if (payload.citizen_charter === "Yes" && !service) {
    notify("Please select a service.");
    return;
  }

  // =====================================================
  // DEFICIENCY
  // =====================================================

  if (hasService && !payload.has_deficiency) {
    notify("Please answer the deficiency question.");
    return;
  }

  // =====================================================
  // RESOLVED
  // =====================================================

  if (!payload.resolved) {
    notify("Please answer if the transaction was catered / resolved.");
    return;
  }

  // =====================================================
  // DETERMINE URL
  // =====================================================

  let url;

  if (IS_STAFF) {
    // STAFF → UPDATE EXISTING TRANSACTION
    if (!transactionId) {
      notify("Transaction ID is missing.");
      return;
    }

    url = `api/transaction/${transactionId}/serve/`;
  } else {
    // SUB-ADMIN / SUPER ADMIN → CREATE NEW TRANSACTION
    if (!clientId) {
      notify("Client ID is missing.");
      return;
    }

    url = `api/client/${clientId}/serve/`;
  }

  // =====================================================
  // SAVE
  // =====================================================

  try {
    const res = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": CSRF_TOKEN,
      },

      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Serve failed");
    }

    // ===================================================
    // SUCCESS
    // ===================================================

    hideModal("serveModal");

    notify(
      IS_STAFF ? "Transaction updated and served." : "Transaction served.",
    );

    loadClients();
  } catch (error) {
    console.error("❌ Serve error:", error);

    notify(error.message || "Unable to serve transaction.");
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
    allTransaction = Array.isArray(data.transactions) ? data.transactions : [];
    console.log("✅ Existing clients loaded:", allTransaction);
    renderClientTable();
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

      if (payload.event !== "CLIENT_REGISTERED") {
        console.log("ℹ️ Ignored event:", payload.event);

        return;
      }

      const client = payload.client;

      if (!client) {
        console.error("❌ WebSocket client data is null");

        console.error("Received payload:", payload);

        return;
      }

      console.log("🟢 NEW CLIENT:", client);

      const existingIndex = allClient.findIndex(
        (item) => String(item.id) === String(client.id),
      );

      if (existingIndex !== -1) {
        allClient.splice(existingIndex, 1);
      }

      allClient.unshift(client);

      currentPage = 1;

      renderClientTable();

      notifyNavbarBell(client.full_name || "New client");

      console.log("✅ Client automatically added to table");
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
