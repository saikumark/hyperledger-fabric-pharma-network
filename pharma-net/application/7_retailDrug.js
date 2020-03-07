'use strict';

/**
 * This is a Node.JS application to sell debug to consumer
 */

const helper = require('./contractHelper');

/**
 * @description Module to transfer the ownership of drug from Retailer to Consumer
 * @param {*} drugName  Name of the drug
 * @param {*} serialNo  Serial No. (batch) of the drug
 * @param {*} retailerCRN  Unique CRN of the company who is selling the drug to consumer
 * @param {*} customerAadhar Aadhaar (name) of the consumer
 * @param {*} organisationRole role of the organisation who will be initiating this process, i.e. retailer
 */
async function main(drugName, serialNo,retailerCRN, customerAadhar,organisationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organisationRole);

		console.log('.....Requesting to create Retail Drug on the Network');
		const newPOBuffer = await pharmanetContract.submitTransaction('retailDrug', drugName, serialNo,retailerCRN, customerAadhar);

		// process response
		console.log('.....Processing Retail Drug Transaction Response \n\n');
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

// main("medicine4","serial5","1234567893","AAD1234567892","retailer").then(() => {
// 	console.log('Shipment updated on the Network');
// });

module.exports.execute = main;
