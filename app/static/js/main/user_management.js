let allUsers = [];
    let tagData = { position: [], division: [], unit: [] };
    let deleteTargetId = null;
    let lastAction = null;

    const PAGE_SIZE = 10;
    let currentPage = 1;

    function resetPageAndRender() {
        currentPage = 1;
        renderTable();
    }

    function goToPage(page) {
        currentPage = page;
        renderTable();
        document.getElementById('userTableBody').closest('.overflow-x-auto').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    async function loadOptions() {
        const res = await fetch('/account/api/options/');
        const data = await res.json();
        tagData = { position: data.positions, division: data.divisions, unit: data.units };

        const divisionFilter = document.getElementById('divisionFilter');
        divisionFilter.innerHTML = '<option value="">All divisions</option>' +
            data.divisions.map(d => `<option value="${d}">${d}</option>`).join('');
    }

    async function loadUsers() {
        const res = await fetch('/account/api/users/');
        const data = await res.json();
        allUsers = data.users;
        renderTable();
    }

    function renderTable() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const division = document.getElementById('divisionFilter').value;
        const status = document.getElementById('statusFilter').value;

        const filtered = allUsers.filter(u => {
            const matchesSearch = u.full_name.toLowerCase().includes(search) || u.username.toLowerCase().includes(search);
            const matchesDivision = !division || u.division === division;
            const matchesStatus = !status || u.status === status;
            return matchesSearch && matchesDivision && matchesStatus;
        });

        // Pagination — 10 ka users ra kada page
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        if (currentPage > totalPages) currentPage = totalPages;
        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

        const tbody = document.getElementById('userTableBody');

        if (pageItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400 text-sm">Wala pay users nga na-match.</td></tr>`;
        } else {
            tbody.innerHTML = pageItems.map(rowHtml).join('');
        }

        const shownStart = filtered.length === 0 ? 0 : startIdx + 1;
        const shownEnd = Math.min(startIdx + PAGE_SIZE, filtered.length);
        document.getElementById('displayCount').textContent = filtered.length === 0 ? '0' : `${shownStart}–${shownEnd}`;
        document.getElementById('totalCount').textContent = filtered.length;

        renderPaginationControls(totalPages);
    }

    function renderPaginationControls(totalPages) {
        const container = document.getElementById('paginationControls');

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let buttons = '';

        buttons += `<button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>`;

        // I-limit ang gipakita nga page numbers kung daghan kaayo (max 5 visible)
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        startPage = Math.max(1, endPage - 4);

        if (startPage > 1) {
            buttons += `<button onclick="goToPage(1)" class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">1</button>`;
            if (startPage > 2) buttons += `<span class="px-1 text-xs text-gray-400">…</span>`;
        }

        for (let p = startPage; p <= endPage; p++) {
            buttons += p === currentPage
                ? `<button class="px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-medium">${p}</button>`
                : `<button onclick="goToPage(${p})" class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">${p}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) buttons += `<span class="px-1 text-xs text-gray-400">…</span>`;
            buttons += `<button onclick="goToPage(${totalPages})" class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">${totalPages}</button>`;
        }

        buttons += `<button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>`;

        container.innerHTML = buttons;
    }

    function initials(name) {
        return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }

    function rowHtml(u) {
        const statusBadge = u.status === 'Active'
            ? `<span class="status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"><span class="w-1.5 h-1.5 rounded-full bg-green-600"></span>Active</span>`
            : `<span class="status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"><span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>Inactive</span>`;

        return `
        <tr data-id="${u.id}">
            <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                    <span class="w-9 h-9 shrink-0 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold">${initials(u.full_name)}</span>
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">${u.full_name}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${u.username}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">${u.position || '—'}</td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">${u.division || '—'}</td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">${u.unit || '—'}</td>
            <td class="px-4 py-3">${statusBadge}</td>
            <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1.5">
                    <button type="button" title="Edit" onclick="openEditUser(${u.id})" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>
                    </button>
                    <button type="button" title="${u.status === 'Active' ? 'Deactivate' : 'Activate'}" onclick="toggleStatus(${u.id})" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                    </button>
                    <button type="button" title="Delete" onclick="openDeleteUser(${u.id})" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                    </button>
                </div>
            </td>
        </tr>`;
    }

    function setupCombobox(inputId, listId, dataKey) {
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);

        function render(filter) {
            const term = (filter || "").trim().toLowerCase();
            const matches = tagData[dataKey].filter(item => item.toLowerCase().includes(term));
            list.innerHTML = "";

            matches.forEach(item => {
                const opt = document.createElement("button");
                opt.type = "button";
                opt.className = "w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30";
                opt.textContent = item;
                opt.onclick = () => { input.value = item; list.classList.add("hidden"); };
                list.appendChild(opt);
            });

            const exactMatch = tagData[dataKey].some(item => item.toLowerCase() === term);
            if (term && !exactMatch) {
                const addBtn = document.createElement("button");
                addBtn.type = "button";
                addBtn.className = "w-full text-left px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-t border-gray-100 dark:border-gray-700 flex items-center gap-1.5";
                addBtn.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg> Add "' + filter + '"';
                addBtn.onclick = () => { input.value = filter; list.classList.add("hidden"); };
                list.appendChild(addBtn);
            }

            list.classList.toggle("hidden", matches.length === 0 && !(term && !exactMatch));
        }

        input.addEventListener("focus", () => render(input.value));
        input.addEventListener("input", () => render(input.value));
        document.addEventListener("click", (e) => {
            if (!input.contains(e.target) && !list.contains(e.target)) list.classList.add("hidden");
        });
    }

    setupCombobox("positionInput", "positionList", "position");
    setupCombobox("divisionInput", "divisionList", "division");
    setupCombobox("unitInput", "unitList", "unit");

    function openAddUser() {
        document.getElementById("userModalTitle").textContent = "Add user";
        document.getElementById("userForm").reset();
        document.getElementById("profileId").value = "";
        document.getElementById("passwordInput").required = true;
        document.getElementById("passwordHint").classList.add("hidden");
        document.getElementById("statusField").classList.add("hidden");
        document.getElementById("formError").classList.add("hidden");
        document.getElementById("userModal").classList.remove("hidden");
    }

    async function openEditUser(profileId) {
        const res = await fetch(`/account/api/users/${profileId}/`);
        const data = await res.json();
        if (!data.success) return;

        const u = data.data;
        document.getElementById("userModalTitle").textContent = "Edit user";
        document.getElementById("profileId").value = u.id;
        document.getElementById("firstNameInput").value = u.first_name;
        document.getElementById("lastNameInput").value = u.last_name;
        document.getElementById("usernameInput").value = u.username;
        document.getElementById("emailInput").value = u.email;
        document.getElementById("contactInput").value = u.contact_number;
        document.getElementById("passwordInput").value = "";
        document.getElementById("passwordInput").required = false;
        document.getElementById("passwordHint").classList.remove("hidden");
        document.getElementById("positionInput").value = u.position;
        document.getElementById("divisionInput").value = u.division;
        document.getElementById("unitInput").value = u.unit;
        document.getElementById("statusInput").value = u.status;
        document.getElementById("statusField").classList.remove("hidden");
        document.getElementById("formError").classList.add("hidden");
        document.getElementById("userModal").classList.remove("hidden");
    }

    function closeUserModal() {
        document.getElementById("userModal").classList.add("hidden");
    }

    function closeSuccessModal() {
        document.getElementById("successModal").classList.add("hidden");
    }

    function showSuccessModal(message) {
        document.getElementById("successModalMessage").textContent = message;
        document.getElementById("successModal").classList.remove("hidden");
    }

    async function submitUserForm(event) {
        event.preventDefault();

        const profileId = document.getElementById("profileId").value;
        const isEdit = !!profileId;
        const url = isEdit ? `/account/api/users/${profileId}/edit/` : '/account/api/users/add/';

        const formData = new FormData(document.getElementById("userForm"));
        if (isEdit) formData.set('status', document.getElementById('statusInput').value);

        const submitBtn = document.getElementById("submitBtn");
        const errorBox = document.getElementById("formError");
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";
        errorBox.classList.add("hidden");

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') },
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                lastAction = { action: isEdit ? 'updated' : 'added', profileId: data.data.id };
                closeUserModal();
                showSuccessModal(data.message);
                await loadUsers();
            } else {
                errorBox.textContent = data.error || "Naay sayop, palihug sulayi pag-usab.";
                errorBox.classList.remove("hidden");
            }
        } catch (err) {
            errorBox.textContent = "Naay sayop sa koneksyon.";
            errorBox.classList.remove("hidden");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Save user";
        }
    }

    async function toggleStatus(profileId) {
        const res = await fetch(`/account/api/users/${profileId}/toggle-status/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
        });
        const data = await res.json();
        if (data.success) {
            lastAction = { action: 'status_toggled', profileId };
            await loadUsers();
        }
    }

    function openDeleteUser(profileId) {
        deleteTargetId = profileId;
        document.getElementById("deleteModal").classList.remove("hidden");
    }

    function closeDeleteModal() {
        deleteTargetId = null;
        document.getElementById("deleteModal").classList.add("hidden");
    }

    async function confirmDelete() {
        if (!deleteTargetId) return;
        const res = await fetch(`/account/api/users/${deleteTargetId}/delete/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
        });
        const data = await res.json();
        closeDeleteModal();
        if (data.success) {
            lastAction = { action: 'deleted', profileId: deleteTargetId };
            await loadUsers();
        }
    }

    function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const socket = new WebSocket(protocol + window.location.host + '/ws/user-management/');

        socket.onmessage = function (event) {
            const data = JSON.parse(event.data);

            const isOwnAction = lastAction && lastAction.profileId === data.profile_id && lastAction.action === data.action;
            lastAction = null;

            loadUsers();

            if (!isOwnAction) {
                const notif = document.getElementById('userNotification');
                notif.textContent = `Na-update ang user list (${data.action}) ni ${data.actor || 'usa ka user'}. Automatic na-refresh ang table.`;
                notif.classList.remove('hidden');
                setTimeout(() => notif.classList.add('hidden'), 5000);
            }
        };

        socket.onclose = function () {
            setTimeout(connectWebSocket, 3000);
        };
    }

    (async function init() {
        await loadOptions();
        await loadUsers();
        connectWebSocket();
    })();