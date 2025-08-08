function fetchTransactions(page = 1, perPage = 2, historyPage = 1, historyPerPage = 2, servingPage = 1, servingPerPage = 1) {
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
                            <span class="transaction-id">${client.client_id}</span>
                            <span class="status ${actionTypeColor}">${client.client_status}</span>
                            <span class="status ${laneColorClass}">${client.client_lane_type}</span>
                            <span class="status ${typeTransaction}">${client.client_transaction_type}</span>
                        </div>
                        <p class="transaction-description"> ${client.client_fullname}, Ticket No. ${client.client_queue_no} </p>
                        ${userunit === 'PACD' ? ``: `<p class="transaction-description"> Transaction Details: ${client.client_transaction_details} </p>`}
                    </div>
                    <div class="transaction-actions">   
                    <span class="timestamp">Date: ${formatDateTime(client.date_created)}</span>
                        ${userunit === 'PACD' ? `
                            <button class="icon-button text-blue" title="Approved" onclick='approveModal("${client.client_fullname}", "${client.client_queue_no}", "${client.client_id}")'>
                                <i class="fa fa-check"></i>
                            </button>
                            <button class="icon-button" title="Forward"
                                onclick="forwardedModal('${client.client_fullname}', '${client.client_queue_no}', '${client.id}')">
                                <i class="fa fa-arrow-circle-right"></i>
                            </button>
                            <button class="icon-button text-red" title="Skipped"
                                onclick="skipClient('${client.id}')">
                                <i class="fa fa-times"></i>
                            </button>
                        ` : `
                            <button class="icon-button text-blue" title="Serving" onclick='toServed("${client.client_fullname}","${client.client_transaction_type}", "${client.client_id}", "${client.id}", "${client.client_transaction_details}", "${client.client_division}")'>
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
                'Pending': 'status-yellow',
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
                        <p class="transaction-description"> ${history.client_fullname}, Ticket No. ${history.client_queue_no}</p>
                        <p class="transaction-description"> Transaction Details: ${history.transactions_details} </p>
                    </div>
                    <div class="transaction-actions">   
                        <span class="timestamp"> Date Resolved: ${formatDateTime(history.date_resolved)}</span>
                        ${userunit === 'PACD' ? `
                            <button class="icon-button text-blue" title="Forward" onclick="repeatTransactions('${history.client_id_primary}', '${history.client_fullname}', '${history.client_queue_no}', '${history.client_org}')">
                                <i class="fa fa-repeat"></i>
                            </button>
                        ` : `
                            <button class="icon-button text-blue" title="Edit")'>
                                <i class="fa fa-edit"></i>
                            </button>                 
                        `}
                        <button class="icon-button text-blue" title="View" onclick="viewClientDetails('${history.id}')">
                                <i class="fa fa-eye"></i>
                            </button>   
                    </div>
                </div>
            `;
            transacHistory.appendChild(card);
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

        // serving list 
        const totalServingPages = Math.ceil(serving.length / servingPerPage);
        const servingStart = (servingPage - 1) * servingPerPage;
        const paginatedServing = serving.slice(servingStart, servingStart + servingPerPage);
        function addServingCard(served) {
        const laneColorClass = served.client_lane_type === 'Priority' ? 'status-red' : 'status-blue';

        const typeColor = {
            'Inquiry': 'status-green',
            'Payment': 'status-orange',
            'Request': 'status-purple',
            'Submit Documents': 'status-cyan',
            'Screening': 'status-yellow',
            'Others': 'status-gray',
        }

        const typeTransaction = typeColor[served.client_transaction_type] || 'status-default';

        const card = document.createElement('div');
        card.className = 'client-card';
        card.innerHTML = `
                <div class="transaction-card">
                    <div>
                        <div class="client-status-row">
                            <span class="transaction-id">${served.client_id}</span>
                            <span class="status status-blue">Serving</span>
                            <span class="status ${laneColorClass}">${served.client_lane_type}</span>
                            <span class="status ${typeTransaction}">${served.client_transaction_type}</span>
                        </div>
                        <p class="transaction-description">${served.client_fullname}, ${served.client_queue_no}</p>
                        <p class="transaction-description">Transaction Details: ${served.transaction_details}</p>
                    </div>
                    <div class="transaction-actions">
                        <span class="timestamp">Time Started: ${formatDateTime(served.date_created)}</span>
                        <button class="icon-button text-blue" title="Approved" onclick='approvedUnit("${served.client_fullname}","${served.client_transaction_type}", "${served.client_id}", "${served.id}", "${served.transaction_details}", "${served.client_queue_no}", "${served.client_contact}")'>
                            <i class="fa fa-check-circle"></i>
                        </button>
                        
                        <button class="icon-button text-blue" title="Approved" onclick='approvedUnits()'>
                            <i class="fa fa-check-circle"></i>
                        </button>
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

        divisionUnitSelect('f-division-select', 'f-unit-select');
        divisionUnitSelect('r-division-select', 'r-unit-select');
    });
}


function getSrvc() {
    fetch(f_transactions, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const selectorList = document.querySelector('#serviceList');
        const serviceSelectWrapper = selectorList.closest('label') || selectorList;
        const csmCheckbox = document.getElementById('unit-csm-checkbox').parentElement;
        const cssCheckbox = document.getElementById('unit-css-checkbox').parentElement;

        selectorList.innerHTML = '';

        const services = data.getServices || [];

        if (services.length > 0) {
            
            serviceSelectWrapper.style.display = 'block';
            csmCheckbox.style.display = 'inline-block';
            cssCheckbox.style.display = 'inline-block';

            const defaultOption = new Option('Select a service avail', '');
            selectorList.appendChild(defaultOption);

            services.forEach(srvc => {
                const option = new Option(
                    `${srvc.service_classification} (${srvc.service_name})`,
                    srvc.service_name
                );
                selectorList.appendChild(option);
            });
        } else {
            serviceSelectWrapper.style.display = 'none';

            csmCheckbox.style.display = 'none';
            cssCheckbox.style.display = 'inline-block';
        }
    })
    .catch(error => {
        console.error('Error fetching services:', error);
    });
}



if (path.includes(transaction)) {
        fetchTransactions();
        getSrvc();
}

document.addEventListener('DOMContentLoaded', () => {
    if (path.includes(transaction)) {
        fetchTransactions();
        getSrvc();
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





