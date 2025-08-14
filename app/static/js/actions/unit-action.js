const {
    skippedClientUnit, updateCLientStatusServedUnitUrl
} = window.dashboardConfig;

function skipClientUnit(id) {
    selectedClient = id;
    if (confirm('Are you sure you want to skip this client?')) {
        fetch(skippedClientUnit, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
            },
            body: `client_id=${selectedClient}`
        })
        .then(response => response.json())
        .then(() => {
            alert('Client skipped successfully!');
        })
        .catch(error => console.error('Error skipping client:', error));
    } else {
        return;
    }
}

function approvedUnitClose() {
    document.getElementById('approvedClient-unit').style.display = 'none';
}
function approvedUnit(name, type, id, cid, details, ticket, contact) {
    selectedClient = cid;
    document.getElementById('client-ticket').innerText = ticket;
    document.getElementById('client-id').innerText = id;
    document.getElementById('client-fullname').innerText = name;
    document.getElementById('client-contact').innerText = contact;
    document.getElementById('unit-transaction-type').innerText = type;
    document.getElementById('unit-transactions-details').innerText = details;
    document.getElementById('approvedClient-unit').style.display = 'flex';
}

function saveActionResolved() {
    const srvcSelect = document.getElementById('serviceList');
    const remarks = document.getElementById('unit-approved-remarks');
    const deficienciesInput = document.getElementById('deficiencies');
    const csmChecked = document.getElementById('unit-csm-checkbox').checked;
    const cssChecked = document.getElementById('unit-css-checkbox').checked;

    const charterCoveredRadio = document.querySelector('input[name="cc-cover"]:checked');
    const charterCoveredValue = charterCoveredRadio ? charterCoveredRadio.value : null; // Q1

    const requirementsRadio = document.querySelector('input[name="requirements"]:checked');
    const requirementsValue = requirementsRadio ? requirementsRadio.value : null; // Q2

    let srvc = "";
    let deficienciesValue = "";

    if (charterCoveredValue === "Yes") {
        // Must select a service
        srvc = srvcSelect.value;
        if (!srvc) {
            alert('Please select a service!');
            return;
        }

        if (requirementsValue === "Yes") {
            // Must provide deficiencies details
            deficienciesValue = deficienciesInput.value.trim();
            if (!deficienciesValue) {
                alert('Please provide deficiencies details!');
                return;
            }
        } else if (requirementsValue === "No") {
            // Keep service value, clear and empty deficiencies
            deficienciesInput.value = "";
            deficienciesValue = "";
        } else {
            alert('Please answer Question 2 (Requirements Met)!');
            return;
        }
    } else if (charterCoveredValue === "No") {
        // Service empty, clear deficiencies
        srvc = "";
        deficienciesInput.value = "";
        deficienciesValue = "";
    } else {
        alert('Please answer Question 1 (Citizen Charter)!');
        return;
    }

    if (!remarks.value.trim()) {
        alert('Please do not leave Remarks blank!');
        return;
    }

    if ((csmChecked && cssChecked) || (!csmChecked && !cssChecked)) {
        alert('Please select only one satisfaction form (CSM or CSS)!');
        return;
    }

    const resolutions = csmChecked ? 'CSM' : 'CSS';

    fetch(updateCLientStatusServedUnitUrl, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `selectedClient=${encodeURIComponent(selectedClient)}&remarks=${encodeURIComponent(remarks.value)}&resolutions=${encodeURIComponent(resolutions)}&srvc_avail=${encodeURIComponent(srvc)}&cc_cover=${encodeURIComponent(charterCoveredValue)}&requirements_met=${encodeURIComponent(requirementsValue)}&deficiencies=${encodeURIComponent(deficienciesValue)}`
    })
    .then(response => response.json())
    .then(() => {
        alert('Successfully catered!');
        approvedUnitClose();
        fetchTransactions();
    })
    .catch(err => {
        console.error('Error updating client:', err);
    });
}




