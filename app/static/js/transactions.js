function getColorFromName(name) {
    const colors = ["#fc6969", "#60a5fa", "#34d399", "#fbbf24", "#c1acff", "#fb7185"];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}


function fetchTransactions(page = 1, perPage = 3, historyPage = 1, historyPerPage = 5, servingPage = 1, servingPerPage = 1) {
    fetch(f_transactions, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const transacHistory = document.querySelector('#todayTransactions');
        const clientList = document.querySelector('#pendingClientList');
        const clientServing = document.querySelector('#servingClientList');
        const paginationControls = document.getElementById('paginationControls');
        const historyPagination = document.getElementById('historyPagination');
        const servingPagination = document.getElementById('servingPagination')
        
        
        clientList.innerHTML = '';
        paginationControls.innerHTML = '';
        transacHistory.innerHTML = ''; // Clear history first
        historyPagination.innerHTML = '';

        const userunit = data.account;
        
        if (userunit !== 'PACD') {
        clientServing.innerHTML = '';
        servingPagination.innerHTML = '';
        }

        const counts = data.total;
        
        const transactionHistory = data.transactionHistory;
        const serving = data.servingClient;

        document.getElementById('total-transactions').textContent = counts['totalTransaction'] || 0;
        document.getElementById('total-completed').textContent = counts['totalCompleted'] || 0;
        document.getElementById('total-skipped').textContent = counts['totalSkipped'] || 0;
        document.getElementById('total-serving').textContent = counts['totalServing'] || 0;

        let priorityClients = data.pending_clients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = data.pending_clients.filter(client => client.client_lane_type !== 'Priority');
        let allClients = [...priorityClients, ...regularClients];

        const totalClientPages = Math.ceil(allClients.length / perPage);
        const start = (page - 1) * perPage;
        const paginatedClients = allClients.slice(start, start + perPage);

        function addClientCard(client, highlight = false) {
            
            const clientType = client.client_lane_type === 'Priority' ? 'status-red' : 'status-blue';

            const actionColor = {
                'Completed': 'status-green',
                'Processing': 'status-blue',
                'Pending': 'status-yellow',
            } 

            const actionTypeColor = actionColor[client.client_status] || 'status-default';
            const initials = client.client_fullname.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2)

            const clientData = {
                transaction_id: client.tid,
                public_id: client.public_id,
                client_id: client.client_id,
                client_fullname: client.client_fullname,
                client_queue_no: client.client_queue_no,
                client_contact: client.client_contact,
                client_org: client.client_org,
                client_transaction_type: client.client_transaction_type,
                client_details: client.client_transaction_details,
            };

            const card = document.createElement('div');
            card.className = 'transaction-history-card';
            card.innerHTML = `
                <div class="transaction-cards grid-pending">
                    <div class="col client-id"><i class="fas fa-user" style="margin-right: 10px;"></i> ${client.client_id}</div>
                    <div class="col client">
                        <div class="avatar">${initials}</div>
                        <div class="info">
                            <div class="name">${client.client_fullname}</div>
                            <div class="email">emma@example.com</div>
                        </div>
                    </div>
                    <div class="col transaction-id">${client.client_queue_no}</div>
                    <div class="col product status ${clientType}">${client.client_lane_type}</div>
                    <div class="col actions">${userunit === 'PACD' ? `
                        <i class="fas fa-check accept" title="Served" onclick='openModal("approved", ${JSON.stringify(clientData)})'></i>
                        <i class="fas fa-sync-alt update" title="Foward" onclick='openModal("forward", ${JSON.stringify(clientData)})'></i>
                        <i class="fas fa-trash delete" title="Skipped" onclick="openSkipModal('${client.id}', '${client.client_fullname}', '${client.client_queue_no}')"></i>
                        ` : `
                        <i class="fas fa-edit serving" title="Serving" onclick='openModal("serving", ${JSON.stringify(clientData)})'></i>
                        <i class="fas fa-trash delete" title="Skipped" onclick="openSkipModal('${client.id}', '${client.client_fullname}', '${client.client_queue_no}')"></i>
                        `}
                    </div>
                </div>
            `;
            clientList.appendChild(card);
            divisionUnitSelect('division-select', 'unit-select');
        }

        function addHistoryCard(history) {
            const actionColor = {
                'Completed': 'status-green',
                'Serving': 'status-blue',
                'Pending': 'status-brown',
            } 
            
            const statusColor = actionColor[history.status] || 'status-default';
            const initials = history.client_fullname.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2)

            const card = document.createElement('div');
            card.className = 'transaction-history-card';
            card.innerHTML = `
                <div class="transaction-cards grid-history">
                    <div class="col client">
                        <div class="avatar">${initials}</div>
                        <div class="info">
                            <div class="name">${history.client_fullname}</div>
                            <div class="email">emma@example.com</div>
                        </div>
                    </div>
                    <div class="col transaction-id">${history.transaction_no}</div>
                    <div class="col type">${history.transaction_type}</div>
                    <div class="col status ${statusColor}"> ${history.status}</div>
                    <div class="col date">${history.date_resolved ? formatDateTime(history.date_resolved) : '---'}</div>
                    <div class="col actions"> ${userunit === 'PACD' ? `
                        <i class="fas fa-eye view"></i>
                        <i class="fas fa-sync-alt update"></i>
                        ` : `
                        <i class="fas fa-eye view"></i>
                        `}
                        
                    </div>
                </div>
            `;
            transacHistory.appendChild(card);
            divisionUnitSelect('division-select', 'unit-select');
        }

        paginatedClients.forEach(addClientCard);

        const totalHistoryPages = Math.ceil(transactionHistory.length / historyPerPage);
        const historyStart = (historyPage - 1) * historyPerPage;
        const paginatedHistory = transactionHistory.slice(historyStart, historyStart + historyPerPage);

        paginatedHistory.forEach(addHistoryCard);

        function renderPagination(container, currentPage, totalPages, callback) {
            const createBtn = (label, isActive = false, isDisabled = false) => {
                const btn = document.createElement('button');
                btn.className = 'pagination-button';
                if (isActive) btn.classList.add('active');
                if (isDisabled) btn.disabled = true;
                btn.textContent = label;
                btn.addEventListener('click', () => {
                    const newPage = label === 'Previous' ? currentPage - 1 :
                                    label === 'Next' ? currentPage + 1 : Number(label);
                    callback(newPage);
                });
                return btn;
            };

            if (totalPages > 1) {
                container.appendChild(createBtn('Previous', false, currentPage === 1));
                for (let i = 1; i <= totalPages; i++) {
                    container.appendChild(createBtn(i, currentPage === i));
                }
                container.appendChild(createBtn('Next', false, currentPage === totalPages));
            }
        }

        const totalServingPages = Math.ceil(serving.length / servingPerPage);
        const servingStart = (servingPage - 1) * servingPerPage;
        const paginatedServing = serving.slice(servingStart, servingStart + servingPerPage);
        function addServingCard(served) {
        const laneColorClass = served.client_lane_type === 'Priority' ? 'status-red' : 'status-blue';

        const typeColor = {
            'Inquiry': 'status-green',
            'Payment': 'status-orange',
            'Request': 'status-purple',
            'Submit Documents   ': 'status-cyan',
            'Screening': 'status-yellow',
            'Others': 'status-gray',
        }

        const typeTransaction = typeColor[served.client_transaction_type] || 'status-default';
        const initials = served.client_fullname.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2)
        // serving client
        const card = document.createElement('div');
        card.className = 'client-card';
        card.innerHTML = `
                <div class="transaction-cards grid-pending">
                    <div class="col client-id"><i class="fas fa-user" style="margin-right: 10px;"></i> ${served.client_id}</div>
                    <div class="col client">
                        <div class="avatar"> ${initials}</div>
                        <div class="info">
                            <div class="name">${served.client_fullname}</div>
                            <div class="email">${served.client_org}</div>
                        </div>
                    </div>
                    <div class="col transaction-id"> ${served.transaction_no}</div>
                    <div class="col type"> ${served.transaction_type}</div>
                    <div class="col actions">
                        <i class="fas fa-check accept" title="Served" onclick='openModal("served", ${JSON.stringify(served)})'></i>
                        <i class="fas fa-trash delete"></i>
                    </div>
                </div>
            `;
            clientServing.appendChild(card);
        }

        paginatedServing.forEach(addServingCard);

        renderPagination(paginationControls, page, totalClientPages, (newPage) => {
            fetchTransactions(newPage, perPage, historyPage, historyPerPage);
        });

        renderPagination(historyPagination, historyPage, totalHistoryPages, (newHistoryPage) => {
            fetchTransactions(page, perPage, newHistoryPage, historyPerPage);
        });
        
        renderPagination(servingPagination, servingPage, totalServingPages, (newServingPage) => {
            fetchTransactions(page, perPage, historyPage, historyPerPage, newServingPage, servingPerPage);
        });

        divisionUnitSelect('division-select', 'unit-select');


        document.querySelectorAll('.client').forEach(el => {
            const name = el.querySelector('.name').innerText;
            const avatar = el.querySelector('.avatar');

            avatar.style.backgroundColor = getColorFromName(name);
        });
    });
}

    if (path.includes(transaction)) {
            fetchTransactions();      
    }


document.addEventListener('DOMContentLoaded', () => {
    if (path.includes(transaction)) {
        fetchTransactions();
    }

    const notifyElement = document.getElementById('notify');
    if (notifyElement) {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (
                    mutation.type === 'childList' ||
                    mutation.type === 'attributes' ||
                    mutation.type === 'characterData'
                ) {
                    fetchTransactions();
                    break;
                }
            }
        });

        observer.observe(notifyElement, {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        });
    }
});

// Modern Modal Functions
function openSkipModal(clientId, fullname, queueNo) {
    document.getElementById('skip-client-id').textContent = clientId;
    document.getElementById('skip-fullname').textContent = fullname;
    document.getElementById('skip-queue-no').textContent = queueNo;
    document.getElementById('skipClientModal').style.display = 'flex';
}

function closeSkipModal() {
    document.getElementById('skipClientModal').style.display = 'none';
}

function confirmSkip() {
    const clientId = document.getElementById('skip-client-id').textContent;
    skipClient(clientId);
    closeSkipModal();
}

// Tab switching for view modal
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');

    // Add active class to clicked tab button
    event.target.classList.add('active');

    // If switching to recent tab, load transaction history
    if (tabName === 'recent') {
        loadClientTransactionHistory();
    }
}

// Load client transaction history for the view modal
function loadClientTransactionHistory() {
    const clientId = document.querySelector('#client-details-list dt:contains("Client ID") + dd')?.textContent ||
                     document.querySelector('#client-details-list dd:first-child')?.textContent;

    if (!clientId) return;

    // This would need to be implemented with a backend endpoint to get client-specific transactions
    // For now, show a placeholder
    const transactionList = document.getElementById('client-transaction-history');
    transactionList.innerHTML = `
        <div class="no-transactions">
            <i class="fas fa-history"></i>
            <p>Transaction history feature coming soon</p>
        </div>
    `;
    document.getElementById('transaction-count').textContent = 'Feature coming soon';
}