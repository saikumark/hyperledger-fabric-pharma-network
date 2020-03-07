'use strict';

/**
 * This is a Node.JS application to raise an Purchase Order
 */

const helper = require('./contractHelper');

/**
 * @description Module to add new Purchase Order raised either by distributor with Manufacturer [OR] retailer with distributor.
 * @param {*} buyerCRN Unique CRN of buyer (Distrbutor or Retailer)
 * @param {*} sellerCRN Unique CRN of Seller (Manufacturer or Distributor)
 * @param {*} drugName Name of the drug
 * @param {*} quantity No of batches (serial) which buyer want to buy from seller
 * @param {*} organisationRole Sent by client app by which the (either Distributor or Retailer) PO has to be raised
 */
async function main(buyerCRN, sellerCRN, drugName, quantity,organisationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organisationRole);

		console.log('.....Requesting to create Purchase Order on the Network');
		const newPOBuffer = await pharmanetContract.submitTransaction('createPO', buyerCRN, sellerCRN, drugName, quantity);

		// process response
		console.log('.....Processing Approve New PO Transaction Response \n\n');
		let newPO = JSON.parse(newPOBuffer.toString());
		console.log(newPOBuffer.toString());
		return newPO;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

// main("1234567893","1234567892","medicine4","1","distributor").then(() => {
// 	console.log('PO added on the Network');
// });

module.exports.execute = main;
