const {
    serviceListUrl
} = window.dashboardConfig;

function fecthServices(page = 1, perPage = 10) {
    fetch(serviceListUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const selectorList = document.querySelector('#serviceListTable tbody');
        const paginationControls = document.getElementById('paginationControls');
        const countDisplay = document.getElementById('accountCount');
        selectorList.innerHTML = '';
        paginationControls.innerHTML = '';
        const counts = data.totalServices || {};

        document.getElementById('total-services').textContent = counts['totalServices'] || 0;
        document.getElementById('srvc-rled').textContent = counts['totalSrvcRLED'] || 0;
        document.getElementById('srvc-msd').textContent = counts['totalSrvcMSD'] || 0;
        document.getElementById('srvc-lhsd').textContent = counts['totalSrvcLHSD'] || 0;
        document.getElementById('srvc-rd').textContent = counts['totalSrvcRDARD'] || 0;

        const services = data.serviceList || [];
        const totalServices = services.length;
        const totalPages = Math.ceil(totalServices / perPage);
        const start = (page - 1) * perPage;
        const paginatedServices = services.slice(start, start + perPage);

        const showingStart = totalServices === 0 ? 0 : start + 1;
        countDisplay.textContent = `Showing ${showingStart} of ${totalServices} services`;

        function addServiceRow(srvc) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${srvc.service_name || '-'}</td>
                <td>${srvc.category || '-'}</td>
                <td>${srvc.classification || '-'}</td>
                <td>${srvc.division || '-'}</td>
                <td>${srvc.unit || '-'}</td>
                <td>${srvc.processing_time || '-'}</td>
            `;
            selectorList.appendChild(row);
        }

        if (paginatedServices.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" class="text-center">No services found.</td>';
            selectorList.appendChild(row);
        } else {
            paginatedServices.forEach(addServiceRow);
        }

        function renderPagination(currentPage, totalPages) {
            const createBtn = (label, isActive = false, isDisabled = false) => {
                const btn = document.createElement('button');
                btn.className = 'pagination-button';
                if (isActive) btn.classList.add('active');
                if (isDisabled) btn.disabled = true;
                btn.textContent = label;
                btn.addEventListener('click', () => {
                    const target = label === 'Previous' ? currentPage - 1 :
                                   label === 'Next' ? currentPage + 1 :
                                   Number(label);
                    fecthServices(target, perPage);
                });
                return btn;
            };

            if (totalPages > 1) {
                paginationControls.appendChild(createBtn('Previous', false, page === 1));
                for (let i = 1; i <= totalPages; i++) {
                    paginationControls.appendChild(createBtn(i, page === i));
                }
                paginationControls.appendChild(createBtn('Next', false, page === totalPages));
            }
        }
        renderPagination(page, totalPages);
    });
}

fecthServices();

// if (path.includes(servicesPage)) {
//     fecthServices();
// }



