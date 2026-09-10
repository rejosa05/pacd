document.addEventListener('DOMContentLoaded', () => {
  fetchLogs();

  document.getElementById('logSearch').addEventListener('input', debounce(() => fetchLogs(), 300));
  document.getElementById('statusFilter').addEventListener('change', () => fetchLogs());
  document.getElementById('dateFrom').addEventListener('change', () => fetchLogs());
  document.getElementById('dateTo').addEventListener('change', () => fetchLogs());

  document.getElementById('editForm').addEventListener('submit', submitEditForm);
  document.getElementById('updateForm').addEventListener('submit', submitUpdateForm);
});

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function fetchLogs(page = 1) {
  const search = document.getElementById('logSearch').value;
  const status = document.getElementById('statusFilter').value;
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;

  const params = new URLSearchParams({ search, status, date_from: dateFrom, date_to: dateTo, page });

  fetch(`${LOGS_API_URL}?${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      renderLogRows(data.results);
      renderStats(data.stats);
      renderPagination(data.total_pages, data.current_page);
    })
    .catch(() => showNotification('Failed to load transaction logs.', true));
}

function renderStats(stats) {
  if (!stats) return;
  const totalEl = document.getElementById('statTotalLogs');
  const waitingEl = document.getElementById('statWaitingLogs');
  if (totalEl) totalEl.textContent = stats.total ?? 0;
  if (waitingEl) waitingEl.textContent = stats.waiting ?? 0;
}

function renderLogRows(logs) {
  const tbody = document.getElementById('logTableBody');
  tbody.innerHTML = '';
  if (!logs.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No transaction logs found.</td></tr>`;
    return;
  }
  logs.forEach(log => {
    tbody.innerHTML += `
      <tr data-id="${log.uid}">
        <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${log.client}</td>
        <td class="px-4 py-3">${log.action}</td>
        <td class="px-4 py-3">${log.transaction_type ?? '—'}</td>
        <td class="px-4 py-3">${statusBadge(log.transaction_status)}</td>
        <td class="px-4 py-3">${log.forwarded_to ?? '—'}</td>
        <td class="px-4 py-3">${log.created_at}</td>
        <td class="px-4 py-3">
          <div class="flex items-center justify-end gap-2">
            <button onclick='openUpdateModal(${JSON.stringify(log)})' class="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">Update</button>
            <button onclick='openEditModal(${JSON.stringify(log)})' class="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">Edit</button>
            <button onclick="confirmDelete('${log.uid}')" class="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">Delete</button>
          </div>
        </td>
      </tr>`;
  });
}

function statusBadge(status) {
  const styles = {
    Served: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Serving: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Forwarded: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    Skipped: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    Waiting: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };
  return `<span class="rounded-full px-2 py-1 text-xs font-semibold ${styles[status] ?? ''}">${status}</span>`;
}

function renderPagination(totalPages, currentPage) {
  const el = document.getElementById('logPagination');
  if (!el) return;
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  let html = '<div class="flex items-center justify-center gap-1">';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button onclick="fetchLogs(${i})" class="rounded-lg px-3 py-1.5 text-sm ${i === currentPage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}">${i}</button>`;
  }
  html += '</div>';
  el.innerHTML = html;
}

// ---------- Modals ----------
function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function openEditModal(log) {
  document.getElementById('editUid').value = log.uid;
  document.getElementById('editTransactionType').value = log.transaction_type ?? '';
  document.getElementById('editHasDeficiency').value = log.has_deficiency ?? '';
  document.getElementById('editDeficiencyDetails').value = log.deficiency_details ?? '';
  document.getElementById('editRemarks').value = log.remarks ?? '';
  openModal('editModal');
}

function openUpdateModal(log) {
  document.getElementById('updateUid').value = log.uid;
  document.getElementById('updateStatus').value = log.transaction_status;
  document.getElementById('updateRemarks').value = log.remarks ?? '';
  openModal('updateModal');
}

function submitEditForm(e) {
  e.preventDefault();
  const uid = document.getElementById('editUid').value;
  const payload = {
    transaction_type: document.getElementById('editTransactionType').value,
    has_deficiency: document.getElementById('editHasDeficiency').value,
    deficiency_details: document.getElementById('editDeficiencyDetails').value,
    remarks: document.getElementById('editRemarks').value,
  };

  fetch(`/transactions/${uid}/edit/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
    body: JSON.stringify(payload),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showNotification('Transaction log updated.');
        closeModal('editModal');
        fetchLogs();
      } else {
        showNotification(data.error || 'Failed to update.', true);
      }
    });
}

function submitUpdateForm(e) {
  e.preventDefault();
  const uid = document.getElementById('updateUid').value;
  const payload = {
    transaction_status: document.getElementById('updateStatus').value,
    remarks: document.getElementById('updateRemarks').value,
  };

  fetch(`/transactions/${uid}/update-status/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
    body: JSON.stringify(payload),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showNotification('Status updated.');
        closeModal('updateModal');
        fetchLogs();
      } else {
        showNotification(data.error || 'Failed to update status.', true);
      }
    });
}

function confirmDelete(uid) {
  if (!confirm('Sigurado ka nga i-delete ni nga transaction log?')) return;
  fetch(`/transactions/${uid}/delete/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': getCookie('csrftoken') },
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showNotification('Transaction log deleted.');
        fetchLogs();
      } else {
        showNotification(data.error || 'Failed to delete.', true);
      }
    });
}

// ---------- Helpers ----------
function showNotification(msg, isError = false) {
  const el = document.getElementById('transactionNotification');
  el.textContent = msg;
  el.classList.remove('hidden', 'border-green-200', 'bg-green-50', 'text-green-800', 'border-red-200', 'bg-red-50', 'text-red-800');
  if (isError) {
    el.classList.add('border-red-200', 'bg-red-50', 'text-red-800');
  } else {
    el.classList.add('border-green-200', 'bg-green-50', 'text-green-800');
  }
  setTimeout(() => el.classList.add('hidden'), 3000);
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}