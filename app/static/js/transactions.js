function fetchTransactions(page = 1, perPage = 3) {
    fetch(f_transactions, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const transacHistory = document.querySelector('#todayTransactions');
        const clientList = document.querySelector('#pendingClientList');
        const paginationControls = document.getElementById('paginationControls');
        
        clientList.innerHTML = '';
        paginationControls.innerHTML = '';
        transacHistory.innerHTML = ''; // Clear history first

        const counts = data.total;
        const userunit = data.account;
        const transactionHistory = data.transactionHistory;

        document.getElementById('total-transactions').textContent = counts['totalTransaction'] || 0;
        document.getElementById('total-completed').textContent = counts['totalCompleted'] || 0;
        document.getElementById('total-skipped').textContent = counts['totalSkipped'] || 0;

        let priorityClients = data.pending_clients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = data.pending_clients.filter(client => client.client_lane_type !== 'Priority');
        let allClients = [...priorityClients, ...regularClients];

        const totalPages = Math.ceil(allClients.length / perPage);
        const start = (page - 1) * perPage;
        const paginatedClients = allClients.slice(start, start + perPage);

        function addClientCard(client, highlight = false) {
            const genderIcon = client.client_gender === 'Male'
                ? '<i class="male-icon fa fa-mars" title="Male"></i>'
                : '<i class="female-icon fa fa-venus" title="Female"></i>';
            
            const laneColorClass = client.client_lane_type === 'Priority' ? 'status-red' : 'status-blue';

            const typeColor = {
                'Inquiry': 'status-green',
                'Payment': 'status-orange',
                'Request': 'status-purple',
                'Submit Documents': 'status-cyan',
                'Screening': 'status-yellow',
                'Others': 'status-gray',
            }

            const actionColor = {
                'Completed': 'status-green',
                'Processing': 'status-blue',
                'Pending': 'status-yellow',
            } 

            const typeTransaction = typeColor[client.client_transaction_type] || 'status-default';
            const actionTypeColor = actionColor[client.client_status] || 'status-default';

            const card = document.createElement('div');
            card.className = 'client-card' + (highlight ? ' highlight' : '');
            card.innerHTML = `
                <div class="transaction-card">
                    <div>
                        <div class="client-status-row">
                            <span class="transaction-id">#CTS-${client.client_id}</span>
                            <span class="transaction-id">#CTS-${client.id}</span>
                            <span class="status ${actionTypeColor}">${client.client_status}</span>
                            <span class="status ${laneColorClass}">${client.client_lane_type}</span>
                            <span class="status ${typeTransaction}">${client.client_transaction_type}</span>
                        </div>
                        <p class="transaction-description"> ${client.client_fullname} Que No. ${client.client_queue_no} </p>
                    </div>
                    <div class="transaction-actions">   
                        ${userunit === 'PACD' ? `
                            <span class="timestamp" ${formatDateTime(client.date_created)}</span>
                            <button class="icon-button text-blue" title="Resolved" onclick='approveModal("${client.client_fullname}", "${client.client_queue_no}", "${client.client_id}")'>
                                <i class="fa fa-check"></i>
                            </button>
                            <button class="icon-button" title="Forward"
                                onclick="forwardedModal('${client.client_fullname}', '${client.client_queue_no}', '${client.client_id}')">
                                <i class="fa fa-arrow-circle-right"></i>
                            </button>
                            <button class="icon-button text-red" title="Skipped"
                                onclick="skipClient('${client.client_id}')">
                                <i class="fa fa-times"></i>
                            </button>
                        ` : `
                            <span class="timestamp">5 min ago</span>
                            <button class="icon-button text-blue" title="Resolved" onclick='approvedUnit("${client.client_fullname}","${client.client_transaction_type}", "${client.client_id}", "${client.id}", "${client.client_transaction_details}")'>
                                <i class="fa fa-check-circle"></i>
                            </button>                 
                            <button class="icon-button text-red" title="Skipped" onclick="skipClientUnit('${client.client_id}')">
                                <i class="fa fa-remove"></i>
                            </button>
                        `}
                    </div>
                </div>
            `;
            clientList.appendChild(card);
        }

        function addHistoryCard(history) {
            const divisionColor = {
                'MSD': 'status-green',
                'LHSD': 'status-orange',
                'RLED': 'status-purple',
                'RD/ARD': 'status-cyan',
            }

            const actionColor = {
                'Completed': 'status-green',
                'Processing': 'status-blue',
            } 
            
            const typeColor = {
                'Inquiry': 'status-green',
                'Payment': 'status-orange',
                'Request': 'status-purple',
                'Submit Documents': 'status-cyan',
                'Screening': 'status-yellow',
                'Others': 'status-gray',
            }
            
            const laneColorClass = history.action_type === 'Priority' ? 'status-red' : 'status-blue';
            const actionTypeColor = actionColor[history.status] || 'status-default';
            const documentType = typeColor[history.transaction_type] || 'status-default';
            const divisionType = divisionColor[history.client_division] || 'status-default';


            const card = document.createElement('div');
            card.className = 'transaction-history-card';
            card.innerHTML = `
                <div class="transaction-card">
                    <div>
                        <div class="client-status-row">
                            <span class="transaction-id">${history.client_id}</span>
                            <span class="status ${actionTypeColor}">${history.status}</span>
                            <span class="status ${divisionType}">${history.client_division}</span>
                            <span class="status ${divisionType}">${history.client_unit}</span>
                            <span class="status ${laneColorClass}">${history.action_type}</span>
                            <span class="status ${documentType}">${history.transaction_type}</span>
                        </div>
                        <p class="transaction-description"> ${history.client_fullname} Que No. ${history.client_queue_no} </p>
                    </div>
                    <div class="transaction-actions">   
                        <span class="timestamp"> Date Resolved: ${formatDateTime(history.date_resolved)}</span>
                        ${userunit === 'PACD' ? `
                            
                            <button class="icon-button text-blue" title="Forward" onclick="forwardedModal('${history.client_fullname}', '${history.client_queue_no}', '${history.id}')">
                                <i class="fa fa-repeat"></i>
                            </button>
                        ` : `
                            <button class="icon-button text-blue" title="Resolved")'>
                                <i class="fa fa-edit"></i>
                            </button>                 
                        `}
                    </div>
                </div>
            `;
            transacHistory.appendChild(card);
        }

        paginatedClients.forEach(addClientCard);
        transactionHistory.forEach(addHistoryCard);

        function renderPagination(currentPage, totalPages) {
            const createBtn = (label, isActive = false, isDisabled = false) => {
                const btn = document.createElement('button');
                btn.className = 'pagination-button';
                if (isActive) btn.classList.add('active');
                if (isDisabled) btn.disabled = true;
                btn.textContent = label;
                btn.addEventListener('click', () => fetchTransactions(
                    label === 'Previous' ? currentPage - 1 : label === 'Next' ? currentPage + 1 : Number(label),
                    perPage
                ));
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
        divisionUnitSelect('f-division-select', 'f-unit-select');
    });
}


if (path.includes(transaction)) {
    fetchTransactions();
}


