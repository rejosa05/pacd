document.addEventListener('DOMContentLoaded', function () {
    const totalTransactions = document.getElementById('total-transactions');
    const convertToExcel = document.getElementById('downloadExcel');
    const dateStartInput = document.getElementById('dateStarted');
    const dateEndInput = document.getElementById('dateEnd');
    const searchInput = document.getElementById('search');

    function fetchAllServedClient() {
        fetch(servedListAll, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
        .then(data => {
        const tableBody = document.querySelector('#transactionHistoryAll tbody');
        tableBody.innerHTML = '';

        const startDate = dateStartInput.value;
        const endDate = dateEndInput.value;
        const search = searchInput.value.toLowerCase();

        const filteredData = data.resolved_clients.filter(client => {
        const dateServed = new Date(client.date_served);

    // Date range filtering
        if (startDate && new Date(startDate) > dateServed) return false;
        if (endDate && new Date(endDate) < dateServed) return false;

    // Search filter
        const combined = [
            client.client_id,
            client.client_fullname,
            client.client_division,
            client.client_unit,
            client.form,
            client.status
        ].join(' ').toLowerCase();

        return combined.includes(search);
        });

        function downloadCSV(data) {
        if (!data.length) {
            alert('No data to download.');
            return;
        }

        const headers = ['Client ID', 'Full Name', 'Division', 'Unit', 'Status', 'Date Served'];
        const rows = data.map(client => [
            `#CT${client.client_id}`,
            client.client_fullname,
            client.client_division,
            client.client_unit,
            client.status,
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
        }
        totalTransactions.textContent = filteredData.length;
        convertToExcel.addEventListener('click', function () {
        downloadCSV(filteredData);
    });

    filteredData.forEach(client => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>#CT${client.client_id}</td>
        <td>${client.client_fullname}</td>
        <td>${client.client_division}</td>
        <td>${client.client_unit}</td>
        <td>${client.status}</td>
        <td>${formatDateTime(client.date_started)}</td>
        <td>${formatDateTime(client.date_served)}</td>
        <td>
        <button class="view-btn" title="View" onclick="viewClientDetails('${client.id}')">
            <i class="fa fa-eye"></i>
        </button>
        </td>
    `;
    tableBody.appendChild(row);
    });
    })
    .catch(error => console.error('Error fetching served clients:', error));
    }

    // Add event listeners after DOM is ready
    dateStartInput.addEventListener('input', fetchAllServedClient);
    dateEndInput.addEventListener('input', fetchAllServedClient);
    searchInput.addEventListener('input', fetchAllServedClient);

    // Initial load
    fetchAllServedClient();
});

