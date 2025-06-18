const {
    queViewUrl, servingClient
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
}

function fetchServingClient() {
    fetch(servingClient, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#servingClients tbody');
        tableBody.innerHTML = '';

        let priorityClients = data.serving_clients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = data.serving_clients.filter(client => client.client_lane_type !== 'Priority');

        function addClientRow(client, color) {
            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td>#CT${client.client_id}</td>
                <td>${client.client_ticket}</td>
                <td>${client.client_transaction}</td>
                <td>${client.client_division}</td>
                <td>${client.client_unit}</td>
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client));
        regularClients.forEach(client => addClientRow(client));
    })
}

if (path.includes(displayQueUrl)) { 
    displayQue();
    fetchServingClient();
    setInterval(displayQue, 2000);
    setInterval(fetchServingClient, 2000);
}
