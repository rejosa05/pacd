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
            fetchTransactions();
            closeModal();
        })
        .catch(error => console.error('Error skipping client:', error));
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
        body: `client_id=${id}&org_name=${org_name}&transaction_type=${transaction_type}
        &transaction_details=${transaction_details}&division=${division}&unit=${unit}`
    })
    .then(response => response.json())
    .then(() => {
        alert('forwarded the client!!');
        closeModal();   
    })
}

function approvedClient(cid) {
    const year = new Date().getFullYear();
    const division = document.getElementById('user-division').value;
    const unit = document.getElementById('user-unit').value;
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
    let requirementsValue = requirementsRadio ? requirementsRadio.value : null; // Q2
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
            deficienciesValue = "N/A";
        } else {
            alert('Please answer Question 2 (Requirements Met)!');
            return;
        }
    } else if (charterCoveredValue === "No") {
        srvc = "not applicable";
        deficienciesValue = "N/A";
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

    // Get transaction number before closing modal

    const transactionNo = `TR-${division}-${unit}-${year}${cid}`;

    fetch(updateClientStatusServedUrl, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${cid}&org_name=${org_name}
        &transactions_type=${transaction_type}&transaction_details=${transaction_details.value}
        &remarks=${remarks.value}&resolutions=${resolutions}&srvc_avail=${encodeURIComponent(srvc)}
        &cc_cover=${encodeURIComponent(charterCoveredValue)}&requirements_value=${encodeURIComponent(requirementsValue)}
        &deficiencies=${encodeURIComponent(deficienciesValue)}&request_processed=${encodeURIComponent(actionValue)}`
    })
    .then(response => response.json())
    .then(() => {
        alert('Successfully catered!');
        fetchTransactions();
        closeModal();

        const receiptUrl = `/acknowledgement/${transactionNo}`;
        window.open(receiptUrl, '_blank');

        console.log(transactionNo);
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

function saveRepeat(id) {
    const transaction_type = document.getElementById('transaction-type').value;
    const transaction_details = document.getElementById('transactions-details').value;
    const division = document.getElementById('division-select').value;
    const unit = document.getElementById('unit-select').value;
    const org_name = document.getElementById('org-name').textContent.trim();
    fetch(repeatTransaction, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${id}&org_name=${encodeURIComponent(org_name)}&transaction_type=${transaction_type}&transaction_details=${transaction_details}&division=${division}&unit=${unit}`
    })
    .then(response => response.json())
    .then(() => {
        
        closeModal();
        fetchTransactions();
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
        body: `transaction-id=${id}`
    })
    .then(response => response.json())
    .then(() => {
        alert('now serving!!');
        closeModal();
        fetchTransactions();
    })   
}

function serveClient(tid, cid, pid) {
    const trnsctionNo = document.getElementById('transaction-no');
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

    // Get transaction number before closing modal
    const transactionNoElement = document.getElementById('transaction-no');
    const transactionNo = transactionNoElement ? transactionNoElement.textContent.trim() : '';

    fetch(updateCLientStatusServedUnitUrl, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `transaction-id=${tid}&remarks=${encodeURIComponent(remarks.value)}
        &resolutions=${encodeURIComponent(resolutions)}&srvc_avail=${encodeURIComponent(srvc)}
        &cc_cover=${encodeURIComponent(charterCoveredValue)}&requirements_met=${encodeURIComponent(requirementsValue)}
        &deficiencies=${encodeURIComponent(deficienciesValue)}&request_processed=${actionValue}`
    })
    .then(response => response.json())
    .then(() => {
        alert('Successfully catered!');
        fetchTransactions();
        closeModal();
        if (transactionNo) {
            const receiptUrl = `/acknowledgement/${transactionNo}`;
            window.open(receiptUrl, '_blank');
        }
    })
}

let activeClientData = {};

function openModal(type, data = {}) {
    const form = document.getElementById("clientForm");
    // const title = document.getElementById("modalTitle");

    // // title.textContent = data.title || "Client Details";

    let htmlContent = `
    <h3> <i class="fa fa-ticket icon_modal" aria-hidden="true" title="Ticket"> </i>  Ticket No. ${data.client_queue_no || "N/A"}</h3>
        <div class="client-info-card">
        <div class="info-row">
                <span class="label">Transactions No:</span>
                <span class="value" id="transaction-no"> ${data.transaction_no || "---"}</span>
            </div>
            <div class="info-row">
                <span class="label">Client ID:</span>
                <span class="value"> ${data.client_id}</span>
            </div>
            <div class="info-row">
                <span class="label">Full Name:</span>
                <span class="value"> ${data.client_fullname || "N/A"}</span>
            </div>
            <div class="info-row">
                <span class="label">Contact:</span>
                <span class="value"> ${data.client_contact || "N/A"} </span>
            </div>
        </div>        
    `;

    if (type === "approved") {
        htmlContent += `
            <div class="modal-body">
                <div class="form-group">
                    <label>Organization</label>
                    <input class="org form-control" type="text" id="org-name" placeholder="Organization/Company Name">
                </div>
                <form class="modern-form">
                    <div class="form-group">
                        <label for="transaction-type">Transactions Type</label>
                        <select class="form-control" name="divisions" id="transaction-type">
                            <option value="">Select Type</option>
                            <option value="Inquiry">Inquire</option>
                            <option value="Submit Documents">Submit Documents</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="r-transactions-details">Transactions Details</label
                    </div>
                    <textarea id="transactions-details" class="textarea form-control" placeholder="Transactions Details....." required=True></textarea>
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label>is transaction covered by Citizen Charter? </label>
                            <label>
                                <input type="radio" name="cc-cover" value="Yes"> Yes
                            </label>
                            <label>
                                <input type="radio" name="cc-cover" value="No"> No
                            </label>
                        </div>
                        <div id="citizen-charter-wrapper">
                            <select class="form-control" name="divisions" id="serviceList"></select>
                        </div>
                        <div id="deficiencies-wrapper">
                            <div class="checkbox-group">
                                <label>if yes, are there deficiencies in the accompanying requirements enumerated in the Citizen's Charter? </label>
                                <label>
                                    <input type="radio" name="requirements" value="Yes"> Yes
                                </label>
                                <label>
                                    <input type="radio" name="requirements" value="No"> No
                                </label>
                            </div>
                            <div id="deficiencies-textarea">
                                <textarea id="deficiencies" class="textarea form-control" placeholder="Deficiencies to comply....." required></textarea>
                            </div>
                        </div>
                        <textarea id="remarks" class="textarea form-control" placeholder="Remarks....." required=True></textarea>
                        <div class="checkbox-group">
                            <label class="form-label">is the transaction request catered and/or resolved? </label>
                            <label><input type="radio" name="request_processed" value="Yes"> Yes </label>
                            <label><input type="radio" name="request_processed" value="No"> No </label>
                        </div>
                        <div class="checkbox-group">
                            <label class="form-label">CSS/CSM:</label>
                            <div id="csm-wrapper">
                                <label><input type="radio" id="csm-checkbox" name="resolution" value="CSM"> CSM </label>
                            </div> 
                            <div id="css-wrapper"><label> <input type="radio" id="css-checkbox" name="resolution" value="CSS"> CSS </label>
                        </div> 
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn-primary"> <i class="fas fa-check"></i> Forward </button>
            </div>
        `;
        setTimeout(initCitizenCharterHandlers, 0);
    }

    if (type === "forward") {
        htmlContent += `
        <div class="modal-body">
            <div class="form-group">
                <label>Organization</label>
                <input class="org form-control" type="text" id="org-name" placeholder="Company Name">
            </div>
            <form class="modern-form">
                <div class="form-group">
                    <label for="transaction-type">Transactions Type</label>
                        <select class="form-control" name="transaction" id="transaction-type">
                            <option value="">Select Type</option>
                            <option value="Inquiry">Inquiry</option>
                            <option value="Request">Request</option>
                            <option value="Submit Documents">Submit Documents</option>
                            <option value="Payment">Payment</option>
                            <option value="Others">Others</option>
                        </select>
                </div>
                <div class="form-group">
                    <label for="r-transactions-details">Transactions Details</label
                </div>
                <textarea id="transactions-details" class="textarea form-control" placeholder="Transaction Details....." required></textarea>
                <div class="form-row">
                    <div class="form-group"> 
                        <label for="division">Division: </label>
                        <select class="form-control" name="divisions" id="division-select">
                            <option value="">Select Division</option>
                            <option value="MSD">MSD</option>
                            <option value="LHSD">LHSD</option>
                            <option value="RD/ARD">RD/ARD</option>
                            <option value="RLED">RLED</option>
                        </select>
                    </div> 
                    <div class="form-group"> 
                        <label for="unit">Unit:</label>
                            <select class="form-control" name="unit" id="unit-select" required>
                                <option value="">Select Unit</option>
                            </select>
                    </div> 
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn-primary"> <i class="fas fa-paper-plane"></i> Forward </button>
        </div>
        `;
    }

    if (type === "serving") {
        htmlContent += `
        <div class="modal-body">
            <div class="form-group">
                <label>Organization:</label>
                <label class="value" type="text" id="org-name" placeholder="Company Name"> ${data.client_org || "Individual"} </label>
            </div>
            <div class="form-group">
                <label>Transaction Type:</label>
                <label class="value" type="text" id="transaction-type" placeholder="Transaction Type"> ${data.client_transaction_type || "N/A"} </label>
            </div>
            <div class="form-group">
                <label>Transaction Details:</label>
                <label class="value" type="text" id="transaction-details" placeholder="Transaction Details"> ${data.client_details || "N/A"} </label>
            </div>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn-primary"> <i class="fas fa-paper-plane"></i> Serving </button>
        </div>
        `;
        setTimeout(initCitizenCharterHandlers, 0);
    }

    if (type === "served") {
        htmlContent += `
        <div class="modal-body">
            <div class="form-group">
                <label>Organization:</label>
                <label class="value" type="text" id="org-name" placeholder="Company Name"> ${data.client_org || "Individual"} </label>
            </div>
            <div class="form-group">
                <label>Transaction Type:</label>
                <label class="value" type="text" id="transaction-type" placeholder="Transaction Type"> ${data.transaction_type || "N/A"} </label>
            </div>
            <div class="form-group">
                <label>Transaction Details:</label>
                <label class="value" type="text" id="transaction-details" placeholder="Transaction Details"> ${data.transaction_details || "N/A"} </label>
            </div>
            <form class="modern-form">
                <div class="form-group">
                    <div class="checkbox-group">
                        <label>is transaction covered by Citizen Charter? </label>
                        <label> <input type="radio" name="cc-cover" value="Yes"> Yes </label>
                        <label> <input type="radio" name="cc-cover" value="No"> No </label>
                    </div>
                    <div id="citizen-charter-wrapper">
                        <select class="form-control" name="divisions" id="serviceList"></select>
                    </div>
                    <div id="deficiencies-wrapper">
                        <div class="checkbox-group">
                            <label>if yes, are there deficiencies in the accompanying requirements enumerated in the Citizen's Charter? </label>
                            <label><input type="radio" name="requirements" value="Yes"> Yes </label>
                            <label><input type="radio" name="requirements" value="No"> No </label>
                        </div>
                        <div id="deficiencies-textarea">
                            <textarea id="deficiencies" class="textarea form-control" placeholder="Deficiencies to comply....." required></textarea>
                        </div>
                    </div>
                    <textarea id="remarks" class="textarea form-control" placeholder="Remarks....." required=True></textarea>
                    <div class="checkbox-group">
                        <label class="form-label">is the transaction request catered and/or resolved? </label>
                        <label><input type="radio" name="request_processed" value="Yes"> Yes </label>
                        <label><input type="radio" name="request_processed" value="No"> No </label>
                    </div>
                    <div class="checkbox-group">
                        <label class="form-label">CSS/CSM:</label>
                        <div id="csm-wrapper">
                            <label><input type="radio" id="csm-checkbox" name="resolution" value="CSM"> CSM </label>
                        </div> 
                        <div id="css-wrapper"><label> <input type="radio" id="css-checkbox" name="resolution" value="CSS"> CSS </label>
                    </div> 
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn-primary"> <i class="fas fa-paper-plane"></i> Serving </button>
        </div>
        `;
        setTimeout(initCitizenCharterHandlers, 0);
    }

    if (type === "repeat") {
        htmlContent += `
        <div class="modal-body">
            <div class="form-group">
                <label>Organization:</label>
                <label class="value" type="text" id="org-name" placeholder="Company Name"> ${data.client_org || "Individual"} </label>
            </div>
            <form class="modern-form">
                <div class="form-group">
                    <label for="transaction-type">Transactions Type</label>
                        <select class="form-control" name="transaction" id="transaction-type">
                            <option value="">Select Type</option>
                            <option value="Inquiry">Inquiry</option>
                            <option value="Request">Request</option>
                            <option value="Submit Documents">Submit Documents</option>
                            <option value="Payment">Payment</option>
                            <option value="Others">Others</option>
                        </select>
                </div>
                <div class="form-group">
                    <label for="r-transactions-details">Transactions Details</label
                </div>
                <textarea id="transactions-details" class="textarea form-control" placeholder="Transaction Details....." required></textarea>
                <div class="form-row">
                    <div class="form-group"> 
                        <label for="division">Division: </label>
                        <select class="form-control" name="divisions" id="division-select">
                            <option value="">Select Division</option>
                            <option value="MSD">MSD</option>
                            <option value="LHSD">LHSD</option>
                            <option value="RD/ARD">RD/ARD</option>
                            <option value="RLED">RLED</option>
                        </select>
                    </div> 
                    <div class="form-group"> 
                        <label for="unit">Unit:</label>
                            <select class="form-control" name="unit" id="unit-select" required>
                                <option value="">Select Unit</option>
                            </select>
                    </div> 
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn-primary"> <i class="fas fa-paper-plane"></i> Repeat </button>
        </div>
        `;
        divisionUnitSelect('division-select', 'unit-select');
    }

    if (type === "skip") {
        htmlContent += `
        <div class="modal-body">
            <form class="modern-form">
                <div class="warning-message">
                    <i class="fas fa-info-circle"></i>
                    <span>Skipping a client will move them to the end of the queue and mark their current transaction as incomplete.</span>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn-primary"> <i class="fas fa-trash delete"></i> Skip </button>
        </div>
        `;
    }

    form.innerHTML = htmlContent;

    document.getElementById("clientModal").style.display = "flex";

    if (type === "forward" || type === "repeat") {
        divisionUnitSelect('division-select', 'unit-select');
        if (window.pendingCount === 0) {
            document.getElementById('unit-select').disabled = true;
        }
    }

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
        } else if (type === "repeat") {
            saveRepeat(data.client_id);
        } else if (type === "skip") {
            skipClient(data.client_id);
        }
    }
}

function closeModal() {
    document.getElementById("clientModal").style.display = "none";
    document.getElementById("clientForm").innerHTML = "";
    activeClientData = {};
}

function initCitizenCharterHandlers() {
    const ccYes = document.querySelector('input[name="cc-cover"][value="Yes"]');
    const ccNo = document.querySelector('input[name="cc-cover"][value="No"]');
    const reqYes = document.querySelector('input[name="requirements"][value="Yes"]');
    const reqNo = document.querySelector('input[name="requirements"][value="No"]');
    const caterYes = document.querySelector('input[name="request_processed"][value="Yes"]');
    const caterNo = document.querySelector('input[name="request_processed"][value="No"]');

    const serviceListWrapper = document.getElementById('serviceList')?.closest('label') || document.getElementById('serviceList');
    const deficienciesWrapper = document.getElementById('deficiencies-wrapper');
    const deficienciesTextarea = document.getElementById('deficiencies-textarea');
    const csmWrapper = document.getElementById('csm-wrapper');
    const cssWrapper = document.getElementById('css-wrapper');

    if (!ccYes || !ccNo || !reqYes || !reqNo) return; // stop if not rendered yet

    serviceListWrapper.style.display = 'none';
    deficienciesWrapper.style.display = 'none';
    deficienciesTextarea.style.display = 'none';
    csmWrapper.style.display = 'none';
    cssWrapper.style.display = 'none';

    [ccYes, ccNo].forEach(input => {
        input.addEventListener('change', function () {
            if (this.value === 'Yes') {
                serviceListWrapper.style.display = 'block';
                deficienciesWrapper.style.display = 'block';
                csmWrapper.style.display = 'block';
                cssWrapper.style.display = 'block';
                getSrvc();
            } else {
                serviceListWrapper.style.display = 'none';
                deficienciesWrapper.style.display = 'none';
                csmWrapper.style.display = 'none';
                cssWrapper.style.display = 'block';
            }
        });
    });

    [reqYes, reqNo].forEach(input => {
        input.addEventListener('change', function () {
            if (this.value === 'Yes') {
                deficienciesTextarea.style.display = 'block';
                cssWrapper.style.display = 'block';
                csmWrapper.style.display = 'none';
            } else {
                deficienciesTextarea.style.display = 'none';
                cssWrapper.style.display = 'none';
                csmWrapper.style.display = 'block';
            } 
        });
    });
    
    [caterYes, caterNo].forEach(input => {
        input.addEventListener('change', function () {
            if (this.value === "Yes") {
                csmWrapper.style.display = 'block';
                cssWrapper.style.display = 'none';
            } else {
                csmWrapper.style.display = 'none';
                cssWrapper.style.display = 'block';
            }
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

        function truncateText(text, limit = 55) {
            return text.length > limit ? text.substring(0, limit) + '...' : text;
        }

        if (services.length > 0) {
            selectorList.appendChild(new Option('Select Service', ''));
            services.forEach(srvc => {
                let fullText = `${srvc.service_classification} (${srvc.service_name})`;
                let shortText = truncateText(fullText, 55);

                let option = new Option(shortText, srvc.service_name);
                option.title = fullText;
                selectorList.appendChild(option);
            });
        } else {
            document.getElementById('citizen-charter-wrapper').style.display = 'none';
            document.getElementById('serviceList').style.display = 'none';
            document.getElementById('deficiencies-wrapper').style.display = 'none';
            document.getElementById('deficiencies-textarea').style.display = 'none';
        }
    })
}



