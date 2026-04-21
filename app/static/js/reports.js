document.addEventListener('DOMContentLoaded', function () {
    const totalTransactions = document.getElementById('total-transactions');
    const totalCSM = document.getElementById('total-csm');
    const totalCSS = document.getElementById('total-css');
    const convertToExcel = document.getElementById('downloadExcel');
    const dateStartInput = document.getElementById('dateStarted');
    const dateEndInput = document.getElementById('dateEnd');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.btn-filter');

    let allClientsCache = [];
    let currentStatusFilter = 'all';
    let currentPage = 1;
    const itemsPerPage = 10;

    function getColorFromName(name) {
    const colors = ["#fc6969", "#60a5fa", "#34d399", "#fbbf24", "#c1acff", "#fb7185"];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

    function formatDateOnly(dateString) {
        return dateString ? new Date(dateString) : null;
    }

    function applyFilters(clients) {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const startDate = formatDateOnly(dateStartInput.value);
        const endDate = formatDateOnly(dateEndInput.value);
        const endOfDay = endDate ? new Date(endDate.getTime() + 86399999) : null;

        return clients.filter(client => {
            // Status filter
            if (currentStatusFilter !== 'all') {
                const statusMap = {
                    'pending': 'Pending',
                    'skipped': 'Skipped',
                    'serving': 'Serving',
                    'completed': 'Completed'
                };
                if (client.client_status !== statusMap[currentStatusFilter]) return false;
            }

            // Date filter
            if (startDate || endDate) {
                if (!client.date_served) return false;
                const servedDate = new Date(client.date_served);
                if (startDate && servedDate < startDate) return false;
                if (endOfDay && servedDate > endOfDay) return false;
            }

            // Search filter
            if (searchTerm) {
                const combined = [
                    client.client_id || '',
                    client.client_fullname || '',
                    client.client_division || '',
                    client.client_unit || '',
                    client.client_status || ''
                ].join(' ').toLowerCase();
                if (!combined.includes(searchTerm)) return false;
            }

            return true;
        });
    }

    function renderPagination(totalItems) {
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalPages <= 1) return;

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.className = 'pagination-button';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderFiltered();
            }
        });
        paginationContainer.appendChild(prevButton);

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = 'pagination-button';
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderFiltered();
            });
            paginationContainer.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.className = 'pagination-button';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderFiltered();
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    function renderFiltered() {
        const filteredData = applyFilters(allClientsCache);
        updateMetrics(filteredData);
        renderTable(filteredData);
        renderPagination(filteredData.length);
    }
    
    function renderTable(clients) {
        const tableBody = document.querySelector('#clientList tbody');
        tableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedClients = clients.slice(startIndex, endIndex);

        paginatedClients.forEach(client => {
            const actionColor = {
                'Completed': 'status-green',
                'Serving': 'status-blue',
                'Pending': 'status-brown',
            } 
            const clientStatus = actionColor[client.client_status] || 'status-default';
            const initials = client.client_fullname.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="product">
                        <div class=""><i class="fas fa-box"></i></div>
                        <div>
                            <div class="transaction-id">${client.transaction_no}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="client">
                        <div class="avatar">${initials}</div>
                        <div class="info">
                            <div class="name">${client.client_fullname || 'N/A'}</div>
                            <div class="email">${client.client_org || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="type">${client.client_division || 'N/A'}</td>
                <td class="type">${client.client_unit || 'N/A'}</td>
                <td>
                    <div class="col status ${clientStatus}"> ${client.client_status}</div>
                </td>
                <td class="date">${client.date_resolved ? formatDateTime(client.date_resolved) : '---'}</td>
                <td>
                    <button class="icon-button text-green" title="View details" onclick="viewClientDetails('${client.id}')">
                        <i class="fa fa-eye view"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.client').forEach(el => {
            const name = el.querySelector('.name').innerText;
            const avatar = el.querySelector('.avatar');

            avatar.style.backgroundColor = getColorFromName(name);
        });
    }

    function updateMetrics(clients) {
        const csmCount = clients.filter(client => client.form === 'CSM').length;
        const cssCount = clients.filter(client => client.form === 'CSS').length;

        if(totalCSM) totalCSM.textContent = csmCount;
        if(totalCSS) totalCSS.textContent = cssCount;
        if(totalTransactions) totalTransactions.textContent = clients.length;
    }

    function downloadCSV(data) {
        if (!data.length) {
            alert('No data to download.');
            return;
        }

        const headers = ['Client ID', 'Full Name', 'Division', 'Unit', 'Status', 'Date Started', 'Date Served'];
        const rows = data.map(client => [
            client.client_id || '',
            client.client_fullname || '',
            client.client_division || '',
            client.client_unit || '',
            client.client_status || '',
            formatDateTime(client.date_started),
            formatDateTime(client.date_served)
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');

        a.href = url;
        a.download = `served_clients_${timestamp}.csv`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function fetchAllServedClient() {
        return fetch(f_dashboard, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
        .then(data => {
            allClientsCache = Array.isArray(data.getClients) ? data.getClients : [];
            currentPage = 1;    
            renderFiltered();
        })
        .catch(error => console.error('Error fetching served clients:', error));
    }

    if (dateStartInput) {
        dateStartInput.addEventListener('change', fetchAllServedClient);
    }

    if (dateEndInput) {
        dateEndInput.addEventListener('change', fetchAllServedClient);
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentStatusFilter = this.dataset.status;
            currentPage = 1;
            renderFiltered();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentPage = 1;
            renderFiltered();
        });
    }

    if (convertToExcel) {
        convertToExcel.addEventListener('click', function (event) {
            event.preventDefault();
            const filteredData = applyFilters(allClientsCache);
            downloadCSV(filteredData);
        });
 
    }

    if (path.includes(reports)) {
        fetchAllServedClient();
    }
});