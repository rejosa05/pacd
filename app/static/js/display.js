const {
    queViewUrl,
} = window.dashboardConfig;

function displayQue() {
    fetch(queViewUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const regularNo = data.regular_lane.client_queue_no || "00";
        const priorityNo = data.priority_lane.client_queue_no || "00";

        document.getElementById('regularCurrent').innerText = regularNo;
        document.getElementById('fastCurrent').innerText = priorityNo;

        window.currentQueueNumbers = {
            regular: regularNo,
            priority: priorityNo
        };
    })
    .catch(error => console.error('Error fetching dashboard queue:', error));
}

function fetchPendingClientsDisplay() {
    fetch(pendingClientsUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#pendingClientQueueTable tbody');
        tableBody.innerHTML = ''; 
        
        const currentRegular = window.currentQueueNumbers?.regular || null;
        const currentPriority = window.currentQueueNumbers?.priority || null;

        let filteredClients = data.pending_clients.filter(client => {
            return client.client_queue_no !== currentRegular && client.client_queue_no !== currentPriority;
        });

        let priorityClients = filteredClients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = filteredClients.filter(client => client.client_lane_type !== 'Priority');

        function addClientRow(client, color) {
            const laneTypeIcon = client.client_lane_type === 'Regular'
                ? '<i class="regular fa fa-angle-double-down"></i>'
                : '<i class="priority fa fa-angle-double-up"></i>';

            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td> ${client.client_queue_no}</td>
                <td>${laneTypeIcon} &nbsp; <span>${client.client_lane_type}</span></td>
                <td>${client.client_transaction_type}</td>
            `;
            tableBody.appendChild(row);
        }
        
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
}

if (path.includes(displayQueUrl)) { 
    displayQue();
    fetchPendingClientsDisplay();
    setInterval(displayQue, 2000);
    setInterval(fetchPendingClientsDisplay, 1000);
}
