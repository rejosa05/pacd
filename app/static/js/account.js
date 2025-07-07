const {
    accountListUrl, addAccountUrl, viewAccount,
} = window.dashboardConfig;

function fetchAccount(page = 1, perPage = 3) {
    const searchQuery = document.getElementById('accountSearch')?.value.toLowerCase() || '';
    fetch(accountListUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const selectorList = document.querySelector('#accountList');
        const paginationControls = document.getElementById('paginationControls');
        const countDisplay = document.getElementById('accountCount');
        selectorList.innerHTML = '';
        paginationControls.innerHTML = '';
        const counts = data.totalAccount || {};

        document.getElementById('total-accounts').textContent = counts['totalAccounts'] || 0;
        document.getElementById('total-active').textContent = counts['totalActive'] || 0;
        document.getElementById('total-inactive').textContent = counts['totalInactive'] || 0;
        document.getElementById('total-for-approval').textContent = counts['totalForApproval'] || 0;

        let accounts = data.accountList || [];

        accounts = accounts.filter(acc => {
            return (
                (acc.full_name || '').toLowerCase().includes(searchQuery) ||
                (acc.position || '').toLowerCase().includes(searchQuery) ||
                (acc.contact || '').toLowerCase().includes(searchQuery) ||
                (acc.email || '').toLowerCase().includes(searchQuery) ||
                (acc.divisions || '').toLowerCase().includes(searchQuery) ||
                (acc.unit || '').toLowerCase().includes(searchQuery)
            );
        });

        const totalAccounts = accounts.length;
        const totalPages = Math.ceil(accounts.length / perPage);
        const start = (page - 1) * perPage;
        const paginatedClients = accounts.slice(start, start + perPage);

        const showingStart = totalAccounts === 0 ? 0 : start + 1;
        
        countDisplay.textContent = `Showing ${showingStart} of ${totalAccounts} accounts`;

        function addAccount(acc, highlight = false) {

            const typeColor = {
                'MSD': 'status-green',
                'LHSD': 'status-orange',
                'RLED': 'status-purple',
                'RD/ARD': 'status-cyan',
            }

            const statusColor = {
                'Active': 'status-green',
                'For Approval': 'status-blue',
                'Inactive': 'status-red',
            }

            const diviosionColor = typeColor[acc.divisions] || 'status-default';
            const statColor = statusColor[acc.status] || 'status-default';
            const card = document.createElement('div');
            card.className = 'client-card' + (highlight ? ' highlight' : '');
            card.innerHTML = `
                <div class="transaction-card"  >
                    <div>
                        <div class="client-status-row">
                            <span class="transaction-id ">${acc.acc_id}</span>
                            <span class="status ${diviosionColor}">${acc.divisions}</span>
                            <span class="status ${diviosionColor}">${acc.unit}</span>
                            <span class="status ${statColor}">${acc.status}</span>
                        </div>
                        <p class="transaction-description"> ${acc.full_name}, ${acc.position}, ${acc.contact}, ${acc.email} </p>
                    </div>
                    <div class="transaction-actions">
                        <span class="timestamp">${formatDateTime(acc.date_created)}</span>
                        <button class="icon-button text-green" title="View" onclick="viewDetails('${acc.id}')">
                        <i class="fa fa-eye"></i></button>
                    </div>
                </div>
            `;
            selectorList.appendChild(card);
        }
        
        paginatedClients.forEach(addAccount);

        function renderPagination(currentPage, totalPages) {
            const createBtn = (label, isActive = false, isDisabled = false) => {
                const btn = document.createElement('button');
                btn.className = 'pagination-button';
                if (isActive) btn.classList.add('active');
                if (isDisabled) btn.disabled = true;
                btn.textContent = label;
                btn.addEventListener('click', () => {
                    const target = label === 'Previous' ? currentPage - 1 :
                                   label === 'Next' ? currentPage + 1 :
                                   Number(label);
                    fetchAccount(target, perPage);
                });
                return btn;
            };

            if (totalPages > 1) {
                paginationControls.appendChild(createBtn('Previous', false, page === 1));
                for (let i = 1; i <= totalPages; i++) {
                    paginationControls.appendChild(createBtn(i, page === i));
                }
                paginationControls.appendChild(createBtn('Next', false, page === totalPages));
            }
        }
        renderPagination(page, totalPages);
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



if (path.includes(accounts)) {
    fetchAccount();
}



