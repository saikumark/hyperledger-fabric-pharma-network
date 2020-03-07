const express = require('express');
const app = express();
const cors = require('cors');
const port = 4000;

// Import all function modules

const addToWallet = require('./1_addToWallet');
const registerCompany = require('./2_registerCompany');
const addDrug = require('./3_addDrug');
const createPO = require('./4_createPO');
const createShipment = require('./5_createShipment');
const updateShipment = require('./6_updateShipment');
const retailDrug = require('./7_retailDrug');
const viewHistory = require('./8_viewHistory');
const viewDrugCurrentState = require('./9_viewDrugCurrentState');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma App');

app.get('/', (req, res) => res.send('Hello Pharma'));

app.post('/addToWallet', (req, res) => {
    addToWallet.execute(req.body.certificatePath, req.body.privateKeyPath,req.body.orgRole).then (() => {
        console.log('Organisation added to wallet successfully');
        const result = {
            status: 'success',
            message: 'Organisation added to wallet successfully'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to organisation into wallet',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/registerCompany', (req, res) => {
    console.log("Register company start");
    registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.location, req.body.orgRole).then ((company) => {
        console.log('Company Registered successfully');
        const result = {
            status: 'success',
            message: 'Company registered successfully',
            company: company
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to register company',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/addDrug', (req, res) => {
    console.log("Drug Addition start");
    addDrug.execute(req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN, req.body.orgRole).then ((drug) => {
        console.log('Drug Added successfully');
        const result = {
            status: 'success',
            message: 'Drug added successfully',
            drug: drug
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to add drug',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/createPO', (req, res) => {
    console.log("Create Purchase Order start");
    createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity, req.body.orgRole).then ((PO) => {
        console.log('PO Added successfully');
        const result = {
            status: 'success',
            message: 'Purchase Order added successfully',
            PO: PO
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to add purchase order',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/createShipment', (req, res) => {
    console.log("Create Shipment for PO - Start");
    createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets,req.body.transporterCRN, req.body.orgRole).then ((shipment) => {
        console.log('Shipment Added successfully');
        const result = {
            status: 'success',
            message: 'Shipment added successfully',
            shipment: shipment
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to add shipment',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/updateShipment', (req, res) => {
    console.log("Update Shipment for PO - Start");
    updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN, req.body.orgRole).then ((drugStatus) => {
        console.log('Drug updated successfully'+drugStatus.toString() );
        const result = {
            status: 'success',
            message: 'Drug updated successfully',
            drugStatus: drugStatus
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to update shipment status of drug',
            error: e
        };
        res.status(500).send(result);
    });
});


app.post('/retailDrug', (req, res) => {
    console.log("Update Shipment for PO - Start");
    retailDrug.execute(req.body.drugName, req.body.serialNo,req.body.retailerCRN, req.body.customerAadhar, req.body.orgRole).then ((drugStatus) => {
        console.log('Drug Sold successfully');
        const result = {
            status: 'success',
            message: 'Drug sold  successfully',
            drugStatus: drugStatus
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to sell drug',
            error: e
        };
        res.status(500).send(result);
    });
});
 


app.post('/viewHistory', (req, res) => {
    console.log("Update Shipment for PO - Start");
    viewHistory.execute(req.body.drugName, req.body.serialNo,req.body.orgRole).then ((drugHistory) => {
        console.log('Drug History');
        const result = {
            status: 'success',
            message: 'Drug history successfully',
            drugHistory: drugHistory
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to sell drug',
            error: e
        };
        res.status(500).send(result);
    });
});


app.post('/viewDrugCurrentState', (req, res) => {
    console.log("View current state of drug");
    viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo,req.body.orgRole).then ((drugStatus) => {
        console.log('Drug Current Status');
        const result = {
            status: 'success',
            message: 'Drug Status fetched successfully',
            drugStatus: drugStatus
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to retrieve  drug status',
            error: e
        };
        res.status(500).send(result);
    });
});



app.listen(port, () => console.log(`Distributed Pharma App listening on port ${port}!`));
