const {
    queViewUrl, servingList
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
    fetch(servingList, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        // Clear all existing content from each division box
        document.querySelectorAll('.clients-list').forEach(div => div.innerHTML = '');

        let priorityClients = data.serving_clients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = data.serving_clients.filter(client => client.client_lane_type !== 'Priority');

        console.log(priorityClients)
        function createClientBox(client) {
            const clientBox = document.createElement('div');
            clientBox.classList.add('client-card'); // Add styling class if needed
            clientBox.innerHTML = `
                <h2>${client.client_id} - ${client.client_unit} - ${client.client_queue_no}</h2>
                
            `;
            return clientBox;
        }

        function insertClient(client) {
            const divisionContainer = document.querySelector(`#${client.client_division} .clients-list`);
            if (divisionContainer) {
                divisionContainer.appendChild(createClientBox(client));
            }
        }
        console.log(1)

        // First priority, then regular
        priorityClients.forEach(client => insertClient(client));
        regularClients.forEach(client => insertClient(client));
    })
}


if (path.includes(displayQueUrl)) { 
    displayQue();
    fetchServingClient();
    setInterval(displayQue, 2000);
    // setInterval(fetchServingClient, 2000);
}
