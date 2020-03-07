'use strict';

/**
 * This is a Node.JS module to load a organisatoin Identity to the wallet.
 * This Identity will be used to sign transactions initiated by each organisation.
 */

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
const path = require('path'); // Support library to build filesystem paths in NodeJs

const crypto_materials = path.resolve(__dirname, '../network/crypto-config'); // Directory where all Network artifacts are stored

// A wallet is a filesystem path that stores a collection of Identities
/**
 * @description module to load organisation identify into the wallet
 * @param {*} certificatePath Public certificate of Peer organisation
 * @param {*} privateKeyPath Private certificate of Peer organisation
 * @param {*} organisationRole  Organisatoin role which needs to be added into the wallet.  This will be dyanmic parameter sent by initiator (client app)
 */
async function main(certificatePath, privateKeyPath, organisationRole) {

	try {

		// Fetch the credentials from our previously generated Crypto Materials required to create identity
		const certificate = fs.readFileSync(certificatePath).toString();
		
		// IMPORTANT: Change the private key name to the key generated on your computer
		const privatekey = fs.readFileSync(privateKeyPath).toString();

		// Load credentials into wallet
		const identityLabel = organisationRole.toUpperCase() + '_ADMIN';
		const identity = X509WalletMixin.createIdentity(organisationRole + 'MSP', certificate, privatekey);

    const wallet = new FileSystemWallet('./identity/'+organisationRole);
		await wallet.import(identityLabel, identity);

	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

// main('/home/upgrad/workspace/drug-counterfeiting/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/signcerts/Admin@distributor.pharma-network.com-cert.pem', 'crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/keystore/83b8730fc2cfe5f6419da79d10cf0805b093b4293aaeb72eddc8d8bb03f5c15a_sk','consumer').then(() => {
//   console.log('Distributor identity added to wallet.');
// });

module.exports.execute = main;
