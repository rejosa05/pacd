const {
    serviceListUrl
} = window.dashboardConfig;

function fecthServices(page = 1, perPage = 4) {
    const searchQuery = document.getElementById('serviceSearch')?.value.toLowerCase() || '';
    fetch(serviceListUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const selectorList = document.querySelector('#serviceList');
        const paginationControls = document.getElementById('paginationControls');
        const countDisplay = document.getElementById('accountCount');
        selectorList.innerHTML = '';
        paginationControls.innerHTML = '';
        const counts = data.totalServices || {};

        document.getElementById('total-services').textContent = counts['totalServices'] || 0;
        document.getElementById('srvc-rled').textContent = counts['totalSrvcRLED'] || 0;
        document.getElementById('srvc-msd').textContent = counts['totalSrvcMSD'] || 0;
        document.getElementById('srvc-lhsd').textContent = counts['totalSrvcLHSD'] || 0;
        document.getElementById('srvc-rd').textContent = counts['totalSrvcRDARD'] || 0;

        let services = data.serviceList || [];

        service = services.filter(srvc => {
            return (
                (srvc.service_name || '').toLowerCase().includes(searchQuery) ||
                (srvc.service_code || '').toLowerCase().includes(searchQuery) ||
                (srvc.classification || '').toLowerCase().includes(searchQuery) ||
                (srvc.division || '').toLowerCase().includes(searchQuery) ||
                (srvc.unit || '').toLowerCase().includes(searchQuery)                
            );
        });

        const totalAccounts = service.length;
        const totalPages = Math.ceil(service.length / perPage);
        const start = (page - 1) * perPage;
        const paginatedClients = service.slice(start, start + perPage);

        const showingStart = totalAccounts === 0 ? 0 : start + 1;
        
        countDisplay.textContent = `Showing ${showingStart} of ${totalAccounts} accounts`;

        function addServiceList(srvc, highlight = false) {

            const typeColor = {
                'MSD': 'status-green',
                'LHSD': 'status-orange',
                'RLED': 'status-purple',
                'RD/ARD': 'status-cyan',
            }

            const clssfction = {
                'Simple': 'status-green',
                'Complex': 'status-yellow',
                'Highly Technical': 'status-red'
            }


            const diviosionColor = typeColor[srvc.division] || 'status-default';
            const statColor = clssfction[srvc.classification] || 'status-default';
            const card = document.createElement('div');
            card.className = 'client-card' + (highlight ? ' highlight' : '');
            card.innerHTML = `
                <div class="transaction-card"  >
                    <div>
                        <div class="client-status-row">
                            <span class="transaction-id ">${srvc.service_code}</span>
                            <span class="status ${statColor}">${srvc.classification}</span>
                            <span class="status ${diviosionColor}">${srvc.division}</span>
                            <span class="status ${diviosionColor}">${srvc.unit}</span>
                        </div>
                        <p class="transaction-description">Service Name: ${srvc.service_name} </p>
                    </div>
                    
                </div>
            `;
            selectorList.appendChild(card);
        }
        
        paginatedClients.forEach(addServiceList);

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
                    fecthServices(target, perPage);
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

fecthServices();

// if (path.includes(servicesPage)) {
//     fecthServices();
// }



