'use strict';

/**
 * This is a Node.JS application to Register a company into the network through wallet identity
 */

const helper = require('./contractHelper');

/**
 * @description Register company into the network through wallet identify
 * @param {*} companyCRN Unique registration number of company to be registered
 * @param {*} companyName Name of the company to be registered
 * @param {*} location Location of the company
 * @param {*} organisationRole Dynamic orgsation role parameter sent by client app, on which the company to be registered
 */
async function main(companyCRN, companyName, location, organisationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organisationRole);

		console.log('.....Requesting to create a New company on the Network');
		const newCompanyBuffer = await pharmanetContract.submitTransaction('registerCompany', companyCRN, companyName, location, organisationRole);

		// process response
		console.log('.....Processing Approve New Company Transaction Response \n\n');
		let newUser = JSON.parse(newCompanyBuffer.toString());
		console.log(newCompanyBuffer);
		return newUser;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

// main("1234567897", 'company7', 'Bangalore1', 'transporter').then(() => {
// 	console.log('Company registered on the Network');
// });

module.exports.execute = main;
