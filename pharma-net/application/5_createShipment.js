'use strict';

/**
 * This is a Node.JS application to create shipment for an PO
 */

const helper = require('./contractHelper');

/**
 * @description Module to create an shipment request for a particular PO raised either by Distributor or Retailer. After this transaction the owner of the drugs will be Transporter who will be shipping these drugs.
 * @param {*} buyerCRN Unique CRN of buyer (either distributor or retailer) who has raised PO
 * @param {*} drugName Drug name which needs to be shipped
 * @param {*} listOfAssets List of serial numbers to be shipped
 * @param {*} transporterCRN Unique CRN of transporter who will be shipping this to buyer location
 * @param {*} organisationRole Sent by client app who initiates this transaction, i.e. either distributor or retailer
 */
async function main(buyerCRN, drugName, listOfAssets,transporterCRN,organisationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organisationRole);

		console.log('.....Requesting to create shipment for an PO on the Network');
		const newPOBuffer = await pharmanetContract.submitTransaction('createShipment', buyerCRN, drugName, listOfAssets,transporterCRN);

		// process response
		console.log('.....Processing Create Shipment Transaction Response \n\n');
		let newPO = JSON.parse(newPOBuffer.toString());
		console.log(newPOBuffer.toString());
		return newPO;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		// throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

main("DIST001","Paracetamol","001,002,003","TRA001","manufacturer").then(() => {
	console.log('Shipment added on the Network');
});

module.exports.execute = main;
