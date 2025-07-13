document.addEventListener('DOMContentLoaded', function () {
    const totalTransactions = document.getElementById('total-transactions');
    const totalCSM = document.getElementById('total-csm');
    const totalCSS = document.getElementById('total-css');
    // const totalCompleted = document.getElementById('total-completed');
    // const totalRDARD = document.getElementById('total-rd/ard');
    // const totalLHSD = document.getElementById('total-lhsd');
    // const totalMSD = document.getElementById('total-msd');
    // const totalRLED = document.getElementById('total-rled');
    const convertToExcel = document.getElementById('downloadExcel');
    const dateStartInput = document.getElementById('dateStarted');
    const dateEndInput = document.getElementById('dateEnd');
    const searchInput = document.getElementById('search');

    function fetchAllServedClient() {
        fetch(f_dashboard, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
        .then(data => {
        const tableBody = document.querySelector('#clientList tbody');
        tableBody.innerHTML = '';

        const startDate = dateStartInput.value;
        const endDate = dateEndInput.value;
        const search = searchInput.value.toLowerCase();

        const filteredData = data.getClients.filter(client => {
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
            client.client_status,
        ].join(' ').toLowerCase();

        return combined.includes(search);
        });

        function downloadCSV(data) {
        if (!data.length) {
            alert('No data to download.');
            return;
        }

        const headers = ['Client ID', 'Full Name', 'Division', 'Unit', 'Status', 'Date Started', 'Date Served'];
        const rows = data.map(client => [
            `${client.client_id}`,
            client.client_fullname,
            client.client_division,
            client.client_unit,
            client.client_status,
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

        // const completedCount = filteredData.filter(client => client.status === 'Completed').length;
        // const rdardCount = filteredData.filter(client => client.client_division === 'RD/ARD').length;
        // const lhsdCount = filteredData.filter(client => client.client_division === 'LHSD').length;
        // const msdCount = filteredData.filter(client => client.client_division === 'MSD').length;
        // const rledCount = filteredData.filter(client => client.client_division === 'RLED').length;
        const csmCount = filteredData.filter(client => client.form === 'CSM').length;
        const cssCount = filteredData.filter(client => client.form === 'CSS').length;
        

        // totalCompleted.textContent = completedCount;
        // totalRDARD.textContent = rdardCount;
        // totalLHSD.textContent = lhsdCount;
        // totalMSD.textContent = msdCount;
        // totalRLED.textContent = rledCount;
        totalCSM.textContent = csmCount;
        totalCSS.textContent = cssCount;
        totalTransactions.textContent = filteredData.length;
        convertToExcel.addEventListener('click', function () {
        downloadCSV(filteredData);
    });

    filteredData.forEach(client => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${client.client_id}</td>
        <td>${client.client_fullname}</td>
        <td>${client.client_division}</td>
        <td>${client.client_unit}</td>
        <td>${client.client_status}</td>
        <td>${formatDateTime(client.date_started)}</td>
        <td>${formatDateTime(client.date_served)}</td>
        <td>
        <button class="icon-button text-green" title="View" onclick="viewClientDetails('${client.id}')">
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

    // Initial loadcd PACD
    if (path.includes(reports)) {
    fetchAllServedClient();
}
      
});