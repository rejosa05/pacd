const {
    dailyDAta
} = window.dashboardConfig;

document.addEventListener('DOMContentLoaded', function () {
    fetch(dailyDAta)
        .then(response => response.json())
        .then(data => {
        const ctx = document.getElementById('dailyOutputChart').getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
            labels: data.labels,
            datasets: [{
                label: 'Clients per Day',
                data: data.values,
                borderColor: '#008000',
                backgroundColor: '#008000',
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
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
});


