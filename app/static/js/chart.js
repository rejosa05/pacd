(function () {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        const sidebarToggle = document.getElementById('sidebar-toggle');

        function openSidebar() {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        }
        function closeSidebar() {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
        if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);
    })();

    // Detect dark mode for chart theming
    const isDarkMode = document.documentElement.classList.contains('dark');
    const labelColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    // Transactions line/bar chart
    const transactionsChart = new ApexCharts(document.querySelector("#transactions-chart"), {
        chart: {
            type: 'bar',
            height: 260,
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        series: [{
            name: 'Transactions',
            data: [162, 190, 178, 205, 231, 140, 98]
        }],
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            labels: { style: { colors: labelColor } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { style: { colors: labelColor } }
        },
        colors: ['#1d4ed8'],
        plotOptions: {
            bar: { borderRadius: 6, columnWidth: '50%' }
        },
        dataLabels: { enabled: false },
        grid: {
            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
            strokeDashArray: 4
        },
        tooltip: { theme: isDarkMode ? 'dark' : 'light' }
    });
    transactionsChart.render();

    // Queue status donut
    const queueDonut = new ApexCharts(document.querySelector("#queue-donut"), {
        chart: {
            type: 'donut',
            height: 260,
            fontFamily: 'inherit'
        },
        series: [6, 2, 3],
        labels: ['Active Windows', 'Idle Windows', 'On Break'],
        colors: ['#1d4ed8', '#e5e7eb', '#f59e0b'],
        legend: {
            position: 'bottom',
            labels: { colors: labelColor }
        },
        dataLabels: { enabled: false },
        tooltip: { theme: isDarkMode ? 'dark' : 'light' }
    });
    queueDonut.render();