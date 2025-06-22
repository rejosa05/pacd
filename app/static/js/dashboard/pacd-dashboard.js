const {
    pacdDashboard, servedListAll, totalCounts
} = window.dashboardConfig;
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
    fetchTotalCounts();
}
