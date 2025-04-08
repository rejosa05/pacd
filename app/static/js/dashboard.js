const { dashboardUrl, resolvedClientsUrl, updateDivisionLogUrl, csrfToken } = window.dashboardConfig;

let selectedClient = null;
let clientData = [];
const queueTable = document.getElementById('queueTable');

function openModal(index) {
    const client = clientData[index];
    if (!client) {
        console.error("Client data not found for index:", index);
        return;
    }
    selectedClient = client;
    document.getElementById('modal-fullname').innerText = client.client_id__client_fullname;
    document.getElementById('modal-transaction').innerText = client.transaction_details;
    document.getElementById('modal-queue-no').innerText = client.client_id__client_queue_no;
    document.getElementById('modal-remarks').value = '';
    document.getElementById('csm-checkbox').checked = false;
    document.getElementById('css-checkbox').checked = false;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    selectedClient = null;
}

function saveModal() {
    if (!selectedClient) return;
    const remarks = document.getElementById('modal-remarks').value;
    const csmChecked = document.getElementById('csm-checkbox').checked;
    const cssChecked = document.getElementById('css-checkbox').checked;

fetch(updateDivisionLogUrl, {
    method: 'POST',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken,
    },
        body: `client_id=${selectedClient.client_id__id}&remarks=${remarks}&csm=${csmChecked}&css=${cssChecked}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    return response.json();
    })
    .then(data => {
    console.log(data.message);
    fetchResolvedData();
    fetchTodayData(); // Refresh the dashboard data
    })
    .catch(error => console.error('Error updating DivisionLog:', error));

    closeModal();
}

function fetchTodayData() {
    fetch(dashboardUrl, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        clientData = data.client_details;

        const tableBody = document.querySelector('#queueTable tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        const priorityClients = clientData.filter(client => client.client_id__client_lane_type === 'Priority');
        const regularClients = clientData.filter(client => client.client_id__client_lane_type !== 'Priority');

        if (clientData.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 5; // Adjust colspan based on your table structure
            emptyCell.textContent = 'No data available';
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
            return;
        }

        clientData.forEach((client, index) => {
            const row = document.createElement('tr');

            const queueNoCell = document.createElement('td');
            queueNoCell.class = 'queue-no-cell'; 
            queueNoCell.textContent = client.client_id__client_queue_no; // Use empty string if undefined
            row.appendChild(queueNoCell);

            const nameCell = document.createElement('td');
            nameCell.class = 'name-cell';
            nameCell.textContent = client.client_id__client_fullname;
            row.appendChild(nameCell);

            const genderCell = document.createElement('td');
            genderCell.className = 'gender-cell';
            const gender = client.client_id__client_gender; // Access gender from client object
            let genderIcon = '';
            if (gender === 'Male') {
                genderIcon = '<i class="male-icon fa fa-mars"></i>';
            } else if (gender === 'Female') {
                genderIcon = '<i class="female-icon fa fa-venus"> </i>';
            }
            genderCell.innerHTML = `
                ${genderIcon}
                <span class="gender-text">${gender}</span>
            `;
            row.appendChild(genderCell);

            const typeCell = document.createElement('td');
            typeCell.textContent = client.client_id__client_lane_type;
            row.appendChild(typeCell);

            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions-cell';
            actionsCell.innerHTML = `
                <div class="actions-container">
                  <button class="action-button1 update-button" title="Update" onclick="openModal(${index})">
                    <i class="fa fa-edit"></i>
                    </button>
                </div>
            `;
            row.appendChild(actionsCell); 

            tableBody.appendChild(row);
        });
        addClientRows(priorityClients);
        addClientRows(regularClients);
    })
    .catch(error => console.error('Error fetching today\'s data:', error));
}

setInterval(fetchTodayData, 5000);
fetchTodayData();

function fetchResolvedData() {
fetch(resolvedClientsUrl, { // Replace 'resolved_clients' with your actual URL
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    const resolvedTableBody = document.querySelector('#resolvedQueueTable tbody');
    resolvedTableBody.innerHTML = ''; // Clear existing rows

    data.resolved_clients.forEach(client => {
        const row = document.createElement('tr');

        const queueNoCell = document.createElement('td');
        queueNoCell.textContent = client.client_id__client_queue_no;
        row.appendChild(queueNoCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = client.client_id__client_fullname;
        row.appendChild(nameCell);

        const genderCell = document.createElement('td');
        genderCell.textContent = client.client_id__client_gender;
        row.appendChild(genderCell);

        const typeCell = document.createElement('td');
        typeCell.textContent = client.client_id__client_lane_type;
        row.appendChild(typeCell);

        const remarksCell = document.createElement('td');
        remarksCell.textContent = client.remarks;
        row.appendChild(remarksCell);

        const formCell = document.createElement('td');
        formCell.textContent = client.form;
        row.appendChild(formCell);

        const resolvedByCell = document.createElement('td');
        resolvedByCell.textContent = client.unit_user;
        resolvedByCell.innerHTML = '<i class="fa fa-user"></i>  ' + client.unit_user;
        row.appendChild(resolvedByCell);

        const dateResolvedCell = document.createElement('td');
        // Format the date as needed
        const date = new Date(client.date_resolved);
        const formattedDate = date.toLocaleDateString(); // Example: "MM/DD/YYYY"
        dateResolvedCell.textContent = formattedDate;
        row.appendChild(dateResolvedCell);

        const actionsCell = document.createElement('td');
            actionsCell.className = 'actions-cell';
            actionsCell.innerHTML = `
                <div class="actions-container">
                  <button class="action-button1 update-button" title="Update" onclick="">
                    <i class="fa fa-edit"></i>
                    </button>
                </div>
            `;
        row.appendChild(actionsCell); 

        resolvedTableBody.appendChild(row);
    });
})
.catch(error => console.error('Error fetching resolved clients:', error));
}
fetchTodayData();
fetchResolvedData();
setInterval(fetchTodayData, 5000);
setInterval(fetchResolvedData, 5000);
