const {
    dailyDAta, monthlyData, typeData, dailyDAtaUnit, monthlyDataUnit, 
} = window.dashboardConfig;

function fetchDailyData() {
    const sampleData = {
        labels: ['June, 01', 'June, 02', 'June, 03', 'June, 04', 'June, 05', 'June, 06', 'June, 07'],
        values: [5, 12, 9, 14, 7, 3, 8]
    };

    fetch(dailyDAta) // Replace with your actual endpoint
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('dailyOutputChart').getContext('2d');

            dailyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    // labels: sampleData.labels,
                    labels: data.labels,
                    datasets: [{
                        label: 'Transactions per Day',
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
    const sampleData = {
        labels: ['May', 'June', 'July'],
        values: [5, 12, 9]
    };
    fetch(monthlyData) // Replace with your actual endpoint
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('monthlyOutputChart').getContext('2d');

            dailyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    // labels: sampleData.labels,
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

function fetchTypeData() {
    fetch(typeData)  // Replace with your Django endpoint
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('typeOutputChart').getContext('2d');

            // Optional: clear existing chart if re-rendering
            if (window.dailyChart) {
                window.dailyChart.destroy();
            }

            // Define colors per transaction type
            const typeColors = {
                'Request': 'rgba(75, 192, 192, 1)',
                'Payment': 'rgba(255, 99, 132, 1)',
                'Submit Document': 'rgba(255, 206, 86, 1)',
                'Inquiry': 'rgba(153, 102, 255, 1)',
                'Others': 'rgb(23, 133, 78)'
            };

            // Build datasets dynamically
            const datasets = data.datasets.map(set => ({
                label: set.label,
                data: set.data,
                borderColor: typeColors[set.label] || 'rgba(0,0,0,0.5)',
                backgroundColor: typeColors[set.label] || 'rgba(0,0,0,0.3)',
                fill: false,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }));

            window.dailyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Daily Transactions by Type'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        },
                        legend: {
                            position: 'top'
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Transactions'
                            },
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error fetching daily data:', error);
        });
}


fetchTypeData();
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



