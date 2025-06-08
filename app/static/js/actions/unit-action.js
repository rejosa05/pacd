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
function approvedUnit(name, type, que, id, details) {
    selectedClient = id;
    clientId = "#CT"+id+"-"+que;
    document.getElementById('client-id').innerText = clientId;
    document.getElementById('client-fullname').innerText = name;
    document.getElementById('transaction-type').innerText = type;
    document.getElementById('transactions-details').innerText = details;
    document.getElementById('approvedClient-unit').style.display = 'flex';
}

function saveActionResolved() {
    const remarks = document.getElementById('approved-remarks');
    const csmChecked = document.getElementById('csm-checkbox');
    const cssChecked = document.getElementById('css-checkbox');

    if (!remarks.value) { 
        alert('please do not leave blanks !!!');
        return;
    }
    
    const isCSM = csmChecked.checked;
    const isCSS = cssChecked.checked;

    if ((isCSM && isCSS) || (!isCSM && !isCSS)) {
        alert('Please select only one satisfaction form (CSM or CSS)!');
        return;
    }

    const resolutions = isCSM ? 'CSM' : 'CSS';

    fetch(updateCLientStatusServedUnitUrl, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${selectedClient}&remarks=${remarks.value}&resolutions=${resolutions}`
    })
    .then(response => response.json())
    .then(() => {
        alert('succefully catered!!!')
        approvedUnitClose();
    })
    .catch(error => console.error('Error resolved client:', error));
}
