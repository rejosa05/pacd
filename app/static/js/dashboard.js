function fetchDashboard() {
    fetch(f_dashboard, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const clientList = document.querySelector('#clientList tbody');
        // clientList.innerHTML = '';
        clientList.innerHTML = '';
        const counts = data.total;
        const percent = data.percentage;
        const userunit = data.account;

        document.getElementById('total-transactions').textContent = counts['totalTransaction'] || 0;
        document.getElementById('total-completed').textContent = counts['totalCompleted'] || 0;
        document.getElementById('percent-add').textContent = percent['percentAdd'] || '0%';
        document.getElementById('percent-completed').textContent = percent['percentCompleted'] || '0%';

        if (userunit === 'PACD') {
            document.getElementById('total-rd').textContent = counts['totalRD'] || 0;
            document.getElementById('total-msd').textContent = counts['totalMSD'] || 0;
            document.getElementById('total-lhsd').textContent = counts['totalLHSD'] || 0;
            document.getElementById('total-rled').textContent = counts['totalRLED'] || 0;

            document.getElementById('percent-rd').textContent = percent['percentRD'] || '0%';
            document.getElementById('percent-msd').textContent = percent['percentMSD'] || '0%';
            document.getElementById('percent-lhsd').textContent = percent['percentLHSD'] || '0%';
            document.getElementById('percent-rled').textContent = percent['percentRLED'] || '0%';
        } else {
            document.getElementById('total-csm').textContent = counts['totalCSM'] || '0';
            document.getElementById('total-css').textContent = counts['totalCSS'] || '0';
            document.getElementById('percent-css').textContent = percent['percentCSM'] || '0%';
            document.getElementById('percent-csm').textContent = percent['percentCSS'] || '0%';
        }

        let fetchClient = data.getClients
        function addClientRow(client) {
            const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.client_id}</td>
            <td>${client.client_fullname}</td>
            <td>${client.client_division}</td>
            <td>${client.client_unit}</td>
            <td>${client.client_status}</td>
            <td>${formatDateTime(client.date_served)}</td>
            <td>
            <button class="icon-button text-green" title="Resolved" onclick="viewClientDetails('${client.id}')">
                <i class="fa fa-eye"></i>
            </button>
            </td>
        `;
        clientList.appendChild(row);
        }
        fetchClient.forEach(client => addClientRow(client));
    })
}

if (path.includes(dashboard, transaction, reports)) {
    fetchDashboard();
}


