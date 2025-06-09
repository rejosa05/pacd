const {
    accountListUrl, addAccountUrl, viewAccount,
} = window.dashboardConfig;

function fetchAccountList() {
    fetch(accountListUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#accountList tbody');
        tableBody.innerHTML = '';

        data.accountList.forEach(account => {
            const f_ = String(account.first_name || '').trim();
            const l_ = String(account.last_name || '').trim();
            const fInitial = f_.charAt(0).toUpperCase();
            const lInitial = l_.charAt(0).toUpperCase();
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>
                <div class="client-info">
                    <div class="initial-circle">${fInitial}${lInitial}</div>    
                    <span>${account.first_name} ${account.last_name}</span>
                </div>
            </td>
            <td>${account.position}</td>
            <td>${account.status}</td>
            <td>
                <button class="edit-btn" title="Edit" onclick="accountEdit('${account.id}',
                '${account.first_name}',
                '${account.last_name}',
                '${account.position}',
                '${account.divisions}',
                '${account.unit}',
                '${account.user}',
                '${account.password}',
                '${account.email}',
                '${account.contact}',
                '${account.status}')"><i class="fa fa-edit"></i></button>
                <button class="view-btn" title="View" onclick="viewDetails('${account.id}')"><i class="fa fa-list"></i></button>
            </td>
            `;
            tableBody.appendChild(row);
        });
        divisionUnitSelect('e-account-division-select', 'e-account-unit-select');
    });
}

function viewDetails(id) {
    fetch(`${viewAccount}${id}/`)
        .then(response => {
            if (!response.ok) throw new Error('Account not found');
            return response.json();
        })
        
        .then(account => {
            const userDetailsList = document.getElementById('user-details-list');
            const detailsOverlay = document.getElementById('view-details-modal');
            const modal = detailsOverlay.querySelector('.modal-view');

            userDetailsList.innerHTML = `
                <dt>ID:</dt><dd> DOHRO13-${account.divisions}-${account.unit}-${account.id}</dd>
                <dt>Name:</dt><dd>${account.first_name} ${account.last_name}</dd>
                <dt>Position:</dt><dd>${account.position}</dd>
                <dt>Division:</dt><dd>${account.divisions}</dd>
                <dt>Unit:</dt><dd>${account.unit}</dd>
                <dt>User:</dt><dd>${account.user}</dd>
                <dt>Email:</dt><dd>${account.email}</dd>
                <dt>Contact:</dt><dd>${account.contact}</dd>
                <dt>Status:</dt><dd>${account.status}</dd>
                <dt>Date Created:</dt><dd>${formatDateTime(account.date_created)}</dd>
            `;
            detailsOverlay.style.display = 'flex';
            modal.focus();
        })
}

if (path.includes(addAccountUrl)) {
    fetchAccountList();
}


