const {
    updateClientStatusServedUrl, forwardedClientToUnit, skippedClient,
    saveUpdateForwardedClientUrl,
    updateDetails, repeatTransaction, servingClientUnit,
    getServices,
    servicesPage
} = window.dashboardConfig;

let selectedClient = null;

function skipClient(id) {
    selectedClient = id;
    if (confirm('Are you sure you want to skip this client?')) {
        fetch(skippedClient, {
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

// fixed function for action
function forwardClient(id) {
    const transaction_type = document.getElementById('transaction-type').value;
    const org_name = document.getElementById('org-name').value;
    const transaction_details = document.getElementById('transactions-details').value;
    const division = document.getElementById('division-select').value;
    const unit = document.getElementById('unit-select').value;

    fetch(forwardedClientToUnit, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${id}&org_name=${org_name}&transaction_type=${transaction_type}&transaction_details=${transaction_details}&division=${division}&unit=${unit}&action_type=forwarded`
    })
    .then(response => response.json())
    .then(() => {
        alert('forwarded the client!!');
        closeModal();   
    })
}

function closeViewDetails () {
    document.getElementById('view-details-modal').style.display = 'none';
}

function approvedClient(id) {
    console.log(id)
    const org_name = document.getElementById('org-name').value;
    const transaction_type = document.getElementById('transaction-type').value;
    const transaction_details = document.getElementById('transactions-details');
    const srvcSelect = document.getElementById('serviceList');
    const remarks = document.getElementById('remarks');
    const deficienciesInput = document.getElementById('deficiencies');
    const csmChecked = document.getElementById('csm-checkbox').checked;
    const cssChecked = document.getElementById('css-checkbox').checked;

    const charterCoveredRadio = document.querySelector('input[name="cc-cover"]:checked');
    const charterCoveredValue = charterCoveredRadio ? charterCoveredRadio.value : null; // Q1

    const requirementsRadio = document.querySelector('input[name="requirements"]:checked');
    const requirementsValue = requirementsRadio ? requirementsRadio.value : null; // Q2
    const actionRadio = document.querySelector('input[name="request_processed"]:checked');
    const actionValue = actionRadio ? actionRadio.value : null; // Q3

    let srvc = "";
    let deficienciesValue = "";

    if (!transaction_type) {
        alert('Please select a transaction type!');
        return;
    }

    if (charterCoveredValue === "Yes") {
        srvc = srvcSelect.value;
        if (!srvc) {
            alert('Please select a service!');
            return;
        }

        if (requirementsValue === "Yes") {
            deficienciesValue = deficienciesInput.value.trim();
            if (!deficienciesValue) {
                alert('Please provide deficiencies details!');
                return;
            }
        } else if (requirementsValue === "No") {
            deficienciesInput.value = "";
            deficienciesValue = "";
        } else {
            alert('Please answer Question 2 (Requirements Met)!');
            return;
        }
    } else if (charterCoveredValue === "No") {
        srvc = "";
        deficienciesInput.value = "";

    } else {
        alert('Please answer Question 1 (Citizen Charter)!');
        return;
    }

    if (!remarks.value.trim() || !transaction_details.value.trim()) {
        alert('Please do not leave Remarks blank!');
        return;
    }

    if ((csmChecked && cssChecked) || (!csmChecked && !cssChecked)) {
        alert('Please select only one satisfaction form (CSM or CSS)!');
        return;
    }

    const resolutions = csmChecked ? 'CSM' : 'CSS';

    fetch(updateClientStatusServedUrl, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${id}&org_name=${org_name}
        &transactions_type=${transaction_type}&transaction_details=${transaction_details.value}
        &remarks=${remarks.value}&resolutions=${resolutions}&srvc_avail=${srvc}
        &cc_cover=${charterCoveredValue}&requirements_met=${encodeURIComponent(requirementsValue)}
        &deficiencies=${deficienciesValue}&request_processed=${actionValue}`
    })
    .then(response => response.json())
    .then(() => {
        alert('succefully catered!!!')
        closeModal();
    })
}


function viewClientDetails(id) {
    fetch(`${viewCLient}${id}/`)
        .then(response => {
            if (!response.ok) throw new Error('Client not found');
            return response.json();
        })
        
        .then(client => {
            const userDetailsList = document.getElementById('client-details-list');
            const detailsOverlay = document.getElementById('view-details-modal');
            const modal = detailsOverlay.querySelector('.modal-view');

            userDetailsList.innerHTML = `
                <dt>Client ID:</dt><dd> #CT${client.client_id}</dd>
                <dt>Full Name:</dt><dd>${client.client_fullname}</dd>
                <dt>Company/Org Name:</dt><dd>${client.client_org}</dd>
                <dt>Gender:</dt><dd>${client.client_gender}</dd>
                <dt>Lane Type:</dt><dd>${client.client_lane_type}</dd>
                <dt>Transaction Type:</dt><dd>${client.client_transaction_type}</dd>
                <dt>Transaction Details:</dt><dd>${client.client_transaction_details}</dd>
                <dt>Division:</dt><dd>${client.client_division}</dd>
                <dt>Unit:</dt><dd>${client.client_unit}</dd>
                <dt>Status:</dt><dd>${client.client_status}</dd>
                <dt>Date Created:</dt><dd>${formatDateTime(client.client_created)}</dd>
                <dt>Date Forwarded:</dt><dd>${formatDateTime(client.client_forwarded)}</dd>
                <dt>Date Resolved:</dt><dd>${formatDateTime(client.client_resolved)}</dd>
                <dt>Remarks:</dt><dd>${client.client_remarks}</dd>
                <dt>Forms:</dt><dd>${client.client_form}</dd>
                <dt>Employee Catered:</dt><dd>${client.client_user}</dd>
            `;
            detailsOverlay.style.display = 'flex';
            modal.focus();
        })
}


function openAddAccount() {
    document.getElementById('add-client').style.display = 'flex';
}

function closeAddAccount() {
    document.getElementById('add-client').style.display = 'none';
}

function saveAccount(){
    const division = document.getElementById('division-select').value;
    const unit = document.getElementById('unit-select').value;
    fetch(saveNewAccount, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
    })
    closeAddAccount();
}

// repeat transactions
function repeatTransactions(id, fname, que, org) {
    selectedClient = id;
    document.getElementById('r-fullname').innerText = fname;
    document.getElementById('r-client-que').innerText = que;
    document.getElementById('r-org').innerText = org;
    document.getElementById('repeatTransaction').style.display = 'flex';
}
function closeRepeat() {
    document.getElementById('repeatTransaction').style.display = 'none';
    selectedClient = null;
}

function saveRepeat() {
    const transaction_type = document.getElementById('r-transaction-type').value;
    const org_name = document.getElementById('f-org-name').value;
    const transaction_details = document.getElementById('r-transactions-details').value;
    const division = document.getElementById('r-division-select').value;
    const unit = document.getElementById('r-unit-select').value;

    fetch(repeatTransaction, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${selectedClient}&org_name=${org_name}&transaction_type=${transaction_type}&transaction_details=${transaction_details}&division=${division}&unit=${unit}`
    })
    .then(response => response.json())
    .then(() => {
        alert('repeat transactions!!');
        closeRepeat();
    })   
}

function servingClient(id) {
    fetch(servingClientUnit, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `selectedClient=${id}`
    })
    .then(response => response.json())
    .then(() => {
        alert('now serving!!');
        closeModal();
    })   
}
function serveClient(id) {
    const srvcSelect = document.getElementById('serviceList');
    const remarks = document.getElementById('remarks');
    const deficienciesInput = document.getElementById('deficiencies');
    const csmChecked = document.getElementById('csm-checkbox').checked;
    const cssChecked = document.getElementById('css-checkbox').checked;

    const charterCoveredRadio = document.querySelector('input[name="cc-cover"]:checked');
    const charterCoveredValue = charterCoveredRadio ? charterCoveredRadio.value : null; // Q1

    const requirementsRadio = document.querySelector('input[name="requirements"]:checked');
    const requirementsValue = requirementsRadio ? requirementsRadio.value : null; // Q2
    const actionRadio = document.querySelector('input[name="request_processed"]:checked');
    const actionValue = actionRadio ? actionRadio.value : null; // Q3

    let srvc = "";
    let deficienciesValue = "";

    if (charterCoveredValue === "Yes") {
        srvc = srvcSelect.value;
        if (!srvc) {
            alert('Please select a service!');
            return;
        }

        if (requirementsValue === "Yes") {
            deficienciesValue = deficienciesInput.value.trim();
            if (!deficienciesValue) {
                alert('Please provide deficiencies details!');
                return;
            }
        } else if (requirementsValue === "No") {
            deficienciesInput.value = "";
            deficienciesValue = "";
        } else {
            alert('Please answer Question 2 (Requirements Met)!');
            return;
        }
    } else if (charterCoveredValue === "No") {
        srvc = "";
        deficienciesInput.value = "";

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
        body: `selectedClient=${id}&remarks=${encodeURIComponent(remarks.value)}
        &resolutions=${encodeURIComponent(resolutions)}&srvc_avail=${encodeURIComponent(srvc)}
        &cc_cover=${encodeURIComponent(charterCoveredValue)}&requirements_met=${encodeURIComponent(requirementsValue)}
        &deficiencies=${encodeURIComponent(deficienciesValue)}&request_processed=${actionValue}`
    })
    .then(response => response.json())
    .then(() => {
        alert('Successfully catered!');
        fetchTransactions();
        closeModal();
    })
    .catch(err => {
        console.error('Error updating client:', err);
    });
}

let activeClientData = {};

function openModal(type, data = {}) {
    const form = document.getElementById("clientForm");
    // const title = document.getElementById("modalTitle");

    // // title.textContent = data.title || "Client Details";

    let htmlContent = `
    <h3> <i class="fa fa-ticket icon_modal" aria-hidden="true" title="Ticket"> </i>  Ticket No. ${data.client_queue_no || "N/A"}</h3>
    <div class="">
        <span class="client-id"> <i class="fa fa-id-badge icon_modal"></i> Client ID: ${data.client_id || "N/A"}</span>
        <span class="client-name"> <i class="fa fa-user icon_modal"></i> ${data.client_fullname || "N/A"}</span>
        <span> <i class="fa fa-phone icon_modal"></i> +63 ${data.client_contact || "N/A"}</span>
    </div>
    `;

    if (type === "approved") {
        htmlContent += `
            <label for="org-name">Organization/Company Name</label>
            <input class="org" type="text" id="org-name" placeholder="Organization/Company Name">
            <label for="transaction-type">Transactions Type</label>
                <select class="form-option" name="divisions" id="transaction-type">
                    <option value="">Select Type</option>
                    <option value="Inquiry">Inquire</option>
                    <option value="Submit Documents">Submit Documents</option>
                    <option value="Others">Others</option>
                </select>
            <label>Transactions Details</label>
            <textarea id="transactions-details" class="remarks-textarea" placeholder="Transactions Details....." required=True></textarea>
            <div id="citizen-charter-wrapper">
                <div class="checkbox-group">
                    <label>is transaction covered by Citizen Charter? </label>
                    <label>
                        <input type="radio" name="cc-cover" value="Yes"> Yes
                    </label>
                    <label>
                        <input type="radio" name="cc-cover" value="No"> No
                    </label>
                </div>
                <select class="form-option" name="divisions" id="serviceList"></select>
                <div id="deficiencies-wrapper">
                    <div class="checkbox-group">
                        <label>if yes, are the requirements in the Citizen's Charter? </label>
                        <label>
                            <input type="radio" name="requirements" value="Yes"> Yes
                        </label>
                        <label>
                            <input type="radio" name="requirements" value="No"> No
                        </label>
                    </div>
                    <div id="deficiencies-textarea">
                        <label>Deficiencies to comply</label>
                        <textarea id="deficiencies" class="remarks-textarea" placeholder="Deficiencies....." required></textarea>
                    </div>
                </div>                   
            </div>
            <label>Remarks</label>
            <textarea id="remarks" class="remarks-textarea" placeholder="Remarks....." required=True></textarea>
            <div class="checkbox-group">
                <label class="form-label">is the transaction request catered and/or resolved? </label>
                <label id="csm-wrapper">
                    <input type="radio" id="" name="request_processed" value="Yes">
                    Yes
                </label>
                <label id="csm-wrapper">
                    <input type="radio" id="" name="request_processed" value="No">
                    No
                </label>
            </div>
            <div class="checkbox-group">
                <label class="form-label">CSS/CSM:</label>
                <label id="csm-wrapper">
                    <input type="checkbox" id="csm-checkbox" name="resolution" value="CSM">
                    CSM
                </label>
                <label id="csm-wrapper">
                    <input type="checkbox" id="css-checkbox" name="resolution" value="CSS">
                    CSS
                </label>
            </div>
            <button type="submit"> Served </button>
        `;
        setTimeout(initCitizenCharterHandlers, 0);
    }

    if (type === "forward") {
        htmlContent += `
            <label for="org-name">Organization/Company Name</label>
            <input class="org" type="text" id="org-name" placeholder="Organization/Company Name">
            <label for="transaction-type">Transactions Type</label>
                <select class="form-option" name="divisions" id="transaction-type">
                    <option value="">Select Type</option>
                    <option value="Inquiry">Inquiry</option>
                    <option value="Request">Request</option>
                    <option value="Submit Documents">Submit Documents</option>
                    <option value="Payment">Payment</option>
                    <option value="Others">Others</option>
                </select>
            <label>Transactions Details</label>
            <textarea id="transactions-details" class="remarks-textarea" placeholder="Transactions Details....." required=True></textarea>
            <label class="form-label" for="division">Division: </label>
                <select class="form-option" name="divisions" id="division-select">
                    <option value="">Select Division</option>
                    <option value="MSD">MSD</option>
                    <option value="LHSD">LHSD</option>
                    <option value="RD/ARD">RD/ARD</option>
                    <option value="RLED">RLED</option>
                </select>
            <label class="form-label" for="unit">Unit:</label>
                <select class="form-option" name="unit" id="unit-select" required>
                    <option value="">Select Unit</option>
                </select>
            <button type="submit"> Forward </button>
        `;
    }

    if (type === "serving") {
        htmlContent += `
            <span class="org-name"> <i class="fa fa-building icon_modal" title="Company"></i> ${data.client_org || "Individual"} </span>
            <span> <i class="fa fa-folder icon_modal" title="Type"></i> ${data.client_transaction_type} </span>
            <span> <i class="fa fa-info-circle icon_modal" title="Transaction Details"></i> Details: ${data.client_details} </span>
            <button type="submit"> Serving </button>
        `;
        setTimeout(initCitizenCharterHandlers, 0);
    }

    if (type === "served") {
        htmlContent += `
            <span class="org-name"> <i class="fa fa-building icon_modal" title="Company"></i> ${data.client_org || "Individual"} </span>
            <span> <i class="fa fa-folder icon_modal" title="Type"></i> ${data.client_transaction_type} </span>
            <span> <i class="fa fa-info-circle icon_modal" title="Transaction Details"></i> Details: ${data.transaction_details} </span>
            <div id="citizen-charter-wrapper">
                <div class="checkbox-group">
                    <label>is transaction covered by Citizen Charter? </label>
                    <label>
                        <input type="radio" name="cc-cover" value="Yes"> Yes
                    </label>
                    <label>
                        <input type="radio" name="cc-cover" value="No"> No
                    </label>
                </div>
                <select class="form-option" name="divisions" id="serviceList"></select>
                <div id="deficiencies-wrapper">
                    <div class="checkbox-group">
                        <label>if yes, are the requirements in the Citizen's Charter? </label>
                        <label>
                            <input type="radio" name="requirements" value="Yes"> Yes
                        </label>
                        <label>
                            <input type="radio" name="requirements" value="No"> No
                        </label>
                    </div>
                    <div id="deficiencies-textarea">
                        <label>Deficiencies to comply</label>
                        <textarea id="deficiencies" class="remarks-textarea" placeholder="Deficiencies....." required></textarea>
                    </div>
                </div>                   
            </div>
            <label>Remarks</label>
            <textarea id="remarks" class="remarks-textarea" placeholder="Remarks....." required=True></textarea>
            <div class="checkbox-group">
                <label class="form-label">is the transaction request catered and/or resolved? </label>
                <label id="csm-wrapper">
                    <input type="radio" id="" name="request_processed" value="Yes">
                    Yes
                </label>
                <label id="csm-wrapper">
                    <input type="radio" id="" name="request_processed" value="No">
                    No
                </label>
            </div>
            <div class="checkbox-group">
                <label class="form-label">CSS/CSM:</label>
                <label id="csm-wrapper">
                    <input type="checkbox" id="csm-checkbox" name="resolution" value="CSM">
                    CSM
                </label>
                <label id="csm-wrapper">
                    <input type="checkbox" id="css-checkbox" name="resolution" value="CSS">
                    CSS
                </label>
            </div>
            <button type="submit"> Served </button>
        `;
        setTimeout(initCitizenCharterHandlers, 0);
    }

    form.innerHTML = htmlContent;

    document.getElementById("clientModal").style.display = "flex";

    form.onsubmit = (e) => {
        e.preventDefault();
        // const formData = new FormData(form);
        if (type === "forward") {
            forwardClient(data.client_id);
        } else if (type === "served") {
            serveClient(data.transaction_id);
        } else if (type === "serving") {
            servingClient(data.transaction_id)
        } else if (type === "approved") {
            approvedClient(data.client_id);
        }
    }
}

function closeModal() {
    document.getElementById("clientModal").style.display = "none";
    document.getElementById("clientForm").innerHTML = "";
    activeClientData = {};
}

function initCitizenCharterHandlers() {
    const firstYes = document.querySelector('input[name="cc-cover"][value="Yes"]');
    const firstNo = document.querySelector('input[name="cc-cover"][value="No"]');
    const secondYes = document.querySelector('input[name="requirements"][value="Yes"]');
    const secondNo = document.querySelector('input[name="requirements"][value="No"]');

    const serviceListWrapper = document.getElementById('serviceList')?.closest('label') || document.getElementById('serviceList');
    const deficienciesWrapper = document.getElementById('deficiencies-wrapper');
    const deficienciesTextarea = document.getElementById('deficiencies-textarea');

    if (!firstYes || !firstNo || !secondYes || !secondNo) return; // stop if not rendered yet

    serviceListWrapper.style.display = 'none';
    deficienciesWrapper.style.display = 'none';
    deficienciesTextarea.style.display = 'none';

    [firstYes, firstNo].forEach(input => {
        input.addEventListener('change', function () {
            if (this.value === 'Yes') {
                serviceListWrapper.style.display = 'block';
                deficienciesWrapper.style.display = 'block';
                getSrvc();
            } else {
                serviceListWrapper.style.display = 'none';
                deficienciesWrapper.style.display = 'none';
            }
        });
    });

    [secondYes, secondNo].forEach(input => {
        input.addEventListener('change', function () {
            deficienciesTextarea.style.display = (this.value === 'Yes') ? 'block' : 'none';
        });
    });
}

function getSrvc() {
    fetch(f_transactions, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const selectorList = document.querySelector('#serviceList');
        selectorList.innerHTML = '';

        const services = data.getServices || [];

        if (services.length > 0) {
            selectorList.appendChild(new Option('Select Service', ''));
            services.forEach(srvc => {
                selectorList.appendChild(
                    new Option(`${srvc.service_classification} (${srvc.service_name})`, srvc.service_name)
                );
            });
        } else {
            document.getElementById('citizen-charter-wrapper').style.display = 'none';
            document.getElementById('serviceList').style.display = 'none';
            document.getElementById('deficiencies-wrapper').style.display = 'none';
            document.getElementById('deficiencies-textarea').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error fetching services:', error);
    });
}



