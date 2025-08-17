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




