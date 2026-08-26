// static/js/main/chart.js
// Sample data lang — palitan ni sa real data gikan sa backend/API pag ready na.

document.addEventListener('DOMContentLoaded', function () {

  // Helper: check if dark mode is active (Flowbite/Tailwind "dark" class sa <html>)
  const isDark = document.documentElement.classList.contains('dark');

  /* ---------------------------------------------------
     1) TRANSACTIONS THIS WEEK — Bar Chart
  --------------------------------------------------- */
  const transactionsEl = document.querySelector('#transactions-chart');
  if (transactionsEl) {
    const transactionsOptions = {
      series: [
        {
          name: 'Transactions',
          data: [180, 210, 165, 240, 198, 132, 90], // Mon - Sun (sample data)
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '45%',
        },
      },
      dataLabels: { enabled: false },
      colors: ['#1c64f2'], // Flowbite primary blue
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        labels: {
          style: { colors: isDark ? '#9ca3af' : '#6b7280' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: isDark ? '#9ca3af' : '#6b7280' },
        },
      },
      grid: {
        borderColor: isDark ? '#374151' : '#e5e7eb',
        strokeDashArray: 4,
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
      },
    };

    const transactionsChart = new ApexCharts(transactionsEl, transactionsOptions);
    transactionsChart.render();
  }

  /* ---------------------------------------------------
     2) QUEUE STATUS — Donut Chart
  --------------------------------------------------- */
  const queueEl = document.querySelector('#queue-donut');
  if (queueEl) {
    const queueOptions = {
      series: [7, 5, 4, 2], // Serving, Waiting, Completed, No Show (sample data)
      labels: ['Serving', 'Waiting', 'Completed', 'No Show'],
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'inherit',
      },
      colors: ['#f59e0b', '#1c64f2', '#0e9f6e', '#f05252'], // amber, blue, green, red
      legend: {
        position: 'bottom',
        labels: { colors: isDark ? '#9ca3af' : '#6b7280' },
      },
      dataLabels: {
        enabled: true,
        style: { fontSize: '12px' },
      },
      stroke: { width: 2, colors: [isDark ? '#1f2937' : '#ffffff'] },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'In Queue',
                color: isDark ? '#e5e7eb' : '#111827',
              },
            },
          },
        },
      },
    };

    const queueChart = new ApexCharts(queueEl, queueOptions);
    queueChart.render();
  }
});