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

        document.getElementById('total-transactions').textContent = counts['totalTransaction'] || 0;
        document.getElementById('total-completed').textContent = counts['totalCompleted'] || 0;
        document.getElementById('total-rd').textContent = counts['totalRD'] || 0;
        document.getElementById('total-msd').textContent = counts['totalMSD'] || 0;
        document.getElementById('total-lhsd').textContent = counts['totalLHSD'] || 0;
        document.getElementById('total-rled').textContent = counts['totalRLED'] || 0;

        document.getElementById('percent-add').textContent = percent['percentAdd'];
        document.getElementById('percent-completed').textContent = percent['percentCompleted'];
        document.getElementById('percent-rd').textContent = percent['percentRD'];
        document.getElementById('percent-msd').textContent = percent['percentMSD'];
        document.getElementById('percent-lhsd').textContent = percent['percentLHSD'];
        document.getElementById('percent-rled').textContent = percent['percentRLED'];

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
        `;
        clientList.appendChild(row);
        }
        fetchClient.forEach(client => addClientRow(client));
    })
}

if (path.includes(dashboard)) {
    fetchDashboard();
}


