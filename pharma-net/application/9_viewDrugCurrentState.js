'use strict';

/**
 * This is a Node.JS application to view current status of an drug
 */

const helper = require('./contractHelper');

/**
 * @description Module to view current status of an drug at anytime an organsation wants to see
 * @param {*} drugName Name of the drug
 * @param {*} serialNo Serial no. (batch) of the drug for which the status to be retrieved
 * @param {*} organisationRole Orgnisation who wants to view current status of an drug
 */
async function main(drugName, serialNo,organisationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organisationRole);

		console.log('.....Requesting to view current status of drug on the Network');
		const newPOBuffer = await pharmanetContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);

		// process response
		console.log('.....Processing view current drug status Transaction Response \n\n');
		let updateShipmentObject = JSON.parse(newPOBuffer.toString());
		console.log(newPOBuffer.toString());
		return updateShipmentObject;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

// main("medicine4","serial5","consumer").then(() => {
// 	console.log('Shipment updated on the Network');
// });

module.exports.execute = main;
