const {
    dailyDAta, monthlyData, dailyDAtaUnit, monthlyDataUnit
} = window.dashboardConfig;

function fetchDailyData() {
    fetch(dailyDAta) // Replace with your actual endpoint
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('dailyOutputChart').getContext('2d');

            dailyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Clients per Day',
                        data: data.values,
                        borderColor: '#008000',
                        backgroundColor: 'rgba(0, 128, 0, 0.1)', // Slightly transparent fill
                        tension: 0.3,
                        pointRadius: 4,                  // Size of the point
                        pointBorderWidth: 3,            // Border thickness of point
                        pointBackgroundColor: '#ffffff', // Fill color of the point
                        pointBorderColor: '#008000',     // Border color of the point
                        pointHoverRadius: 8,                     // Size when hovered
                        pointHoverBackgroundColor: '#008000',    // Fill color on hover
                        pointHoverBorderColor: '#004d00',        // Border color on hover
                        pointHoverBorderWidth: 3, 
                        fill: true                        
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching daily data:', error));
}

function fetchMonthlyData() {
    fetch(monthlyData) // Replace with your actual endpoint
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('monthlyOutputChart').getContext('2d');

            dailyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Clients per Monthly',
                        data: data.values,
                        borderColor: '#008000',
                        backgroundColor: '#008000', // Slightly transparent fill
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
}

function fetchDailyDataUnit() {
    fetch(dailyDAtaUnit) // Replace with your actual endpoint
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('dailyOutputChart').getContext('2d');

            dailyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Clients per Day',
                        data: data.values,
                        borderColor: '#008000',
                        backgroundColor: '#008d31', // Slightly transparent fill
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching daily data:', error));
}

function fetchMonthlyDataUnit() {
    fetch(monthlyDataUnit) // Replace with your actual endpoint
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('monthlyOutputChart').getContext('2d');

            dailyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Clients per Monthly',
                        data: data.values,
                        borderColor: '#008000',
                        backgroundColor: '#008d31', // Slightly transparent fill
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
}


fetchDailyData();
fetchMonthlyData();
// if (path.includes(pacdDashboard)) {
//     fetchDailyData();
//     fetchMonthlyData();
// }

// if (path.includes(unitDashboard)) {
//     fetchDailyDataUnit();
//     fetchMonthlyDataUnit();
// }



