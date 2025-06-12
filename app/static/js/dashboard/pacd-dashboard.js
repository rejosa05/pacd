const {
    pacdDashboard, servedListAll, totalCounts
} = window.dashboardConfig;

function fetchAllServedClient() {
    fetch(servedListAll, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#transactionHistoryAll tbody');
        tableBody.innerHTML = '';

        data.resolved_clients.forEach(client => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#CT${client.client_id}</td>
                <td>${client.client_fullname}</td>
                <td>${client.client_division}</td>
                <td>${client.client_unit}</td>
                <td>${client.status}</td>
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

function fetchTotalCounts() {
  fetch(totalCounts, {
    method: 'GET',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => response.json())
  .then(data => {
    const counts = data.total;
    document.getElementById('total-transactions').textContent = counts['Total'] || 0;
    document.getElementById('total-completed').textContent = counts['Completed'] || 0;
    document.getElementById('total-csm').textContent = counts['CSM'] || 0;
    document.getElementById('total-css').textContent = counts['CSS'] || 0;
  })
  .catch(error => {
    console.error('Error fetching transaction counts:', error);
  });
}


if (path.includes(pacdDashboard)) {
    fetchAllServedClient();
    fetchTotalCounts();
}
