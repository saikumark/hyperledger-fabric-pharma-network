'use strict';

/**
 * This is a Node.JS application to Update shipping status of an Purchase Order
 */

const helper = require('./contractHelper');

/**
 * @description Module to update shipment status of an PO and ownership of the drug with the new owner information. 
 * @param {*} buyerCRN Unique CRN of buyer who raised PO 
 * @param {*} drugName Name of the drug
 * @param {*} transporterCRN Unique CRN of transporter who is responsible for delivering the drugs with buyer
 * @param {*} organisationRole Role who would be performing this operation, to be sent by client app
 */
async function main(buyerCRN, drugName, transporterCRN,organisationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organisationRole);

		console.log('.....Requesting to update shipment of an PO on the Network');
		const newPOBuffer = await pharmanetContract.submitTransaction('updateShipment', buyerCRN, drugName, transporterCRN);

		// process response
		console.log('.....Processing Shipment fof PO Transaction Response \n\n');
		let updateShipmentObject = JSON.parse(newPOBuffer.toString());
		console.log(newPOBuffer.toString());
		return updateShipmentObject;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		//throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

// main("DIST001","Paracetamol","TRA001","transporter").then(() => {
// 	console.log('Shipment updated on the Network');
// });

module.exports.execute = main;
