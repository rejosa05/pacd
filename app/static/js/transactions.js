function fetchTransactions(page = 1, perPage = 3) {
    fetch(f_transactions, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const clientList = document.querySelector('#pendingClientList');
        const paginationControls = document.getElementById('paginationControls');
        clientList.innerHTML = '';
        paginationControls.innerHTML = '';
        const counts = data.total;
        const userunit = data.account;

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

            const typeTransaction = typeColor[client.client_transaction_type] || 'status-default';

            const card = document.createElement('div');
            card.className = 'client-card' + (highlight ? ' highlight' : '');
            card.innerHTML = `
                <div class="transaction-card"  >
                    <div>
                        <div class="client-status-row">
                            <span class="transaction-id ">#CTS-${client.client_id}</span>
                            <span class="status status-yellow">${client.client_status}</span>
                            <span class="status ${laneColorClass}">${client.client_lane_type}</span>
                            <span class="status ${typeTransaction}">${client.client_transaction_type}</span>
                        </div>
                        <p class="transaction-description"> ${client.client_fullname} Que No. ${client.client_queue_no} </p>
                    </div>
                        <div class="transaction-actions">   
                           ${userunit === 'PACD' ? `
                                <span class="timestamp">5 min ago</span>
                                <button class="icon-button text-blue" title="Resolved" onclick='approveModal("${client.client_fullname}", "${client.client_queue_no}", "${client.client_id}")'>
                                    <i class="fa fa-check"></i>
                                </button>
                                <button class="forward-btn" title="Forward"
                                    onclick="forwardedModal('${client.client_fullname}', '${client.client_queue_no}', '${client.client_id}')">
                                    <i class="fa fa-mail-forward"></i>
                                </button>
                                <button class="icon-button text-red" title="Skipped"
                                    onclick="skipClient('${client.client_id}')">
                                    <i class="fa fa-times"></i>
                                </button>
                            ` : `
                                <span class="timestamp">5 min ago</span>
                                <button class="icon-button text-blue" title="Resolved" onclick='approvedUnit("${client.client_fullname}","${client.client_transaction_type}", "${client.client_queue_no}", "${client.client_id}", "${client.client_transaction_details}")'>
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
        
        paginatedClients.forEach(addClientCard);

        function renderPagination(currentPage, totalPages) {
            const createBtn = (label, isActive = false, isDisabled = false) => {
                const btn = document.createElement('button');
                btn.className = 'pagination-button';
                if (isActive) btn.classList.add('active');
                if (isDisabled) btn.disabled = true;
                btn.textContent = label;
                btn.addEventListener('click', () => fetchTransactions(label === 'Previous' ? currentPage - 1 : label === 'Next' ? currentPage + 1 : Number(label), perPage));
                return btn;
            };

            if (totalPages > 1) {
                paginationControls.appendChild(createBtn('Previous', false, currentPage === 1));
                for (let i = 1; i <= totalPages; i++) {
                    paginationControls.appendChild(createBtn(i, currentPage === i));
                }
                paginationControls.appendChild(createBtn('Next', false, currentPage === totalPages));
            }
        }
        
        renderPagination(page, totalPages);
        divisionUnitSelect('f-division-select', 'f-unit-select');
    });
}

if (path.includes(transaction)) {
    fetchTransactions();
}


