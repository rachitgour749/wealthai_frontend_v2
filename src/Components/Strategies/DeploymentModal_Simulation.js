
// Simulation of the Redux state and Component Logic for DeploymentModal

const accountDetailsVariants = [
    { status: 'success', data: { broker_name: 'AngelOne', client_id: 'SRKH1512', client_name: 'Rachit' } }
];

let currentAccountDetails = accountDetailsVariants[0];
let isClient = true;
let clients = [];

// Simulate effect to populate clients initially
function simulateUseEffect() {
    console.log('--- Effect Run ---');
    const details = currentAccountDetails?.data || currentAccountDetails;

    if (isClient && details && details.client_id) {
        clients = [{
            id: 1,
            clientId: details.client_id,
            clientName: details.client_name || 'My Account',
            broker: details.broker_name,
            multiple: 1,
            finalCapital: '₹1,00,000'
        }];
        console.log('Initial Clients Set:', clients);
    }
}

// Simulate handleClientFinalCapitalChange logic for user input
function handleClientFinalCapitalChange(id, value) {
    console.log(`\nUser changing capital for ID ${id} to: "${value}"`);
    // Logic from component: just update state directly to allow input
    clients = clients.map(client => {
        if (client.id === id) {
            return {
                ...client,
                finalCapital: value
            };
        }
        return client;
    });
    console.log('Updated Clients State:', clients);
}

// Simulate Deploy Logic (stripping formatting)
function simulateDeploy() {
    console.log('\n--- Deploy Simulation ---');
    const clientInfo = {};
    clients.forEach(client => {
        // Remove currency symbol and commas from finalCapital
        const capitalValue = client.finalCapital.replace(/[₹$,]/g, '').trim();
        clientInfo[client.clientId] = capitalValue;
    });
    console.log('Client Info for Payload:', clientInfo);
}

// Run Simulation
simulateUseEffect();
handleClientFinalCapitalChange(1, '50,000');
simulateDeploy();

handleClientFinalCapitalChange(1, '₹75000');
simulateDeploy();
