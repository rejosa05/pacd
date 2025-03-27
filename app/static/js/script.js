document.addEventListener('DOMContentLoaded', function () {
    const divisionSelect = document.getElementById('division-select');
    const unitSelect = document.getElementById('unit-select');

    const unitOptions = {
        'MSD': ['HRMDU', 'Cashier', 'Finance'],
        'LHSD': ['MAIP', 'LHS Chief', 'Pharmacy'],
        'RD/ARD': ['Research', 'Legal', 'PACD', 'RD', 'ARD'],
        'RLED': ['Unit 1', 'Unit 2', 'Unit 3'] // Example for RLED
    };

    divisionSelect.addEventListener('change', function () {
        const selectedDivision = divisionSelect.value;
        const units = unitOptions[selectedDivision] || [];

        // Clear existing options
        unitSelect.innerHTML = '';

        // Add a placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.textContent = 'Select Unit';
        placeholderOption.value = '';
        unitSelect.appendChild(placeholderOption);

        // Populate new options
        units.forEach(unit => {
            const option = document.createElement('option');
            option.textContent = unit;
            option.value = unit;
            unitSelect.appendChild(option);
        });
    });
});