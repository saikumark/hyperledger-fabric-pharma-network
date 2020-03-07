'use strict';

const {Contract} = require('fabric-contract-api');
// const Client = require('fabric-client');

// const logger = Client.getLogger('APPLICATION');

/**
 * Contract for Pharma Network
 */
class PharmaNetContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.pharmanet');

		//Global variables which contains various organisation value.  This will be used to restrict methods to be called by certain organisation 
		global.manufacturerOrg = 'manufacturer.pharma-network.com';
		global.distributorOrg = 'distributor.pharma-network.com';
		global.retailerOrg = 'retailer.pharma-network.com';
		global.consumerOrg = 'consumer.pharma-network.com';
		global.transporterOrg = 'transporter.pharma-network.com';
	}
	
	/**
	 * @description Internal prvate method to validate whether initiator is allowed to access certain method.  This method will be called in all public methods.
	 * @param {*} ctx The transaction context object
	 * @param {*} initiators Array of initiator organisation for which the access to the method to be allowed
	 * @returns hierarchKey of the organisation which will be used to determine whether certain operations are performed as per their hierarchy in the network
	 */
	validateInitiator(ctx, initiators)
	{
		const initiatorID = ctx.clientIdentity.getX509Certificate();
		console.log(initiatorID);

		let matchOrg = 0;
		let matchItem = '';
		let hierarchyKey = 0;
		//For each initator check the access
		initiators.forEach((item, i) => {
			if(initiatorID.issuer.organizationName.trim() === item)
			{
				if(item === retailerOrg){
					hierarchyKey = 3;
				}
				else if(item === distributorOrg){
					hierarchyKey = 2;
				}
				else if (item  === manufacturerOrg){
					hierarchyKey = 1;
				}
				matchOrg =1;
				matchItem = item;
			}
			else{
				matchItem = item;
			}
		});

		if(!matchOrg){
			throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName.trim() + matchItem + ' not authorised to initiate this transaction');
		}
		else{
			return hierarchyKey;
		}

	}


	/**
	 * @description Instantiate smart contract in the network
	 * @param {*} ctx ctx The transaction context object
	 */
	async instantiate(ctx) {
		console.log('Pharma Network Smart Contract Instantiated');
	}

	/**
	 * @description Method to register a company in the network to perform various operations on the drug.
	 * @param {*} ctx The transaction context object
	 * @param {*} companyCRN Unique CRN of a company which needs to be registered
	 * @param {*} companyName Name of the company
	 * @param {*} location Location of the company situated
	 * @param {*} organisationRole Organisation role in the network 
	 * @access Manufacturer, Distributor, Retailer, Transporter
	 * @returns newly created company object
	 */
	async registerCompany(ctx, companyCRN, companyName, location, organisationRole)
	{

		let hierarchyKey = this.validateInitiator(ctx,[manufacturerOrg, distributorOrg, retailerOrg, transporterOrg]);

		// Create a new composite key for the new company request
		//NOTE: As per the requirement the composite key to be created with companyCRN and companyName, but in other modules , especially in addDrug there is no arguement for companyName.  Hence creating composite key only with companyCRN
		const requestKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.company' , [companyCRN]);

		console.log(requestKey);

		let companyObject={
			companyId: requestKey,
			name: companyName,
			location: location,
			organisationRole: organisationRole,
			hierarchyKey: hierarchyKey,
			createdAt: new Date()
		};

		// Convert the JSON object to a buffer and send it to blockchain for storage
		let dataBuffer = Buffer.from(JSON.stringify(companyObject));
		await ctx.stub.putState(requestKey, dataBuffer);

		// Return value of new company registered in the network
		return companyObject;
	}

	/**
	 * @description Method to add new drug information in the network , requested by Manufacturer.
	 * @param {*} ctx The transaction context object
	 * @param {*} drugName Drug name
	 * @param {*} serialNo Unique serial no of the drug
	 * @param {*} mfgDate Manufacturing date
	 * @param {*} expDate Expiry date
	 * @param {*} companyCRN Manufacturer company CRN
	 * @access Manufacturer
	 * @returns Newly added drug details
	 */
	async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN)
	{

		//Only manufacturer is allowed to add drug into the network
		this.validateInitiator(ctx, [manufacturerOrg]);


		let companyObject = {};

		if(companyCRN){

			const companyKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.company', [companyCRN]);
			let companyBuffer= await ctx.stub.getState(companyKey).catch(err => console.log(err));
			
			//Proceed only if the company registered in the network
			if(companyBuffer){

					companyObject = JSON.parse(companyBuffer.toString());

					//Proceed to add drug into the network only if the organisation role is manufacturer
					if(companyObject.organisationRole === 'manufacturer'){

						//unique drug key
						const drugKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.drug', [drugName, serialNo]);

						let drugObject={
							productId: drugKey,
							name: drugName,
							manufacturer: companyKey,
							manufacturingDate: mfgDate,
							expiryDate: expDate,
							owner: companyKey,
							shipment: '',
							createdAt: new Date()
						};

						console.log(drugObject);

						let drugBuffer = Buffer.from(JSON.stringify(drugObject));
						await ctx.stub.putState(drugKey, drugBuffer);
						return drugObject;
					}
					else{
						throw new Error("Only Manufacturer can add drug into the network");
					}
			}
			else{
				throw new Error("Invalid input for Company Registration Number");
			}
		}
		else{
			//raise exception that company is not registered in the network
			throw new Error('Company is not registered in the Pharma Network' );
		}
	}


	/**
	 * @description Method to create Purchase Order for particular drug into the network
	 * @param {*} ctx The transaction context object
	 * @param {*} buyerCRN Unique CRN of buyer company (Distributor or Retailer)
	 * @param {*} sellerCRN Unique CRN of seller company (Manufacturer or Distributor)
	 * @param {*} drugName Name of drug
	 * @param {*} quantity No. of quantity for which the PO has to be created
	 * @access Distributor , Retailer
	 * @returns purchase object created in the network
	 */
	async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity)
	{

		//Create PO is allowed either by distributor or Retailer
		this.validateInitiator(ctx, [distributorOrg, retailerOrg]);

		const buyerKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.company', [buyerCRN]);
		let buyerBuffer= await ctx.stub.getState(buyerKey).catch(err => console.log(err));
		let buyerObject= JSON.parse(buyerBuffer.toString());

		const sellerKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.company', [sellerCRN]);
		let sellerBuffer= await ctx.stub.getState(sellerKey).catch(err => console.log(err));
		let sellerObject = JSON.parse(sellerBuffer.toString());

		console.log("Buyer Organization : " + buyerObject.organisationRole);
		console.log("seller Organization : " + sellerObject.organisationRole);

		//Orgnisation of role of seller should be either ( manufacturer && distributor ) OR (distributor && retailer)
		if((sellerObject.hierarchyKey == 1 && buyerObject.hierarchyKey ===2) || (sellerObject.hierarchyKey == 2 && buyerObject.hierarchyKey == 3)){

			const purchaseOrderKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.purchaseOrder', [buyerCRN,drugName]);

			let purchaseOrderObject={
				poID: purchaseOrderKey,
				drugName: drugName,
				quantity: quantity,
				buyer: buyerKey,
				seller: sellerKey,
				createdAt: new Date()
			};

			console.log(purchaseOrderObject);

			//Create purchase order in the network
			let purchaseOrderBuffer = Buffer.from(JSON.stringify(purchaseOrderObject));
			await ctx.stub.putState(purchaseOrderKey, purchaseOrderBuffer);
			return purchaseOrderObject;
		}
		else{
			throw new Error("Purchase Order doesn't follow hierarchy. You can raise PO either with Manufacturer or Distributor");
		}
	}


	/**
	 * @description Method to create shipment for PO exists in the network, with in-transit status 
	 * @param {*} ctx The transaction context object
	 * @param {*} buyerCRN  Unique CRN of the buyer
	 * @param {*} drugName Name of the drug
	 * @param {*} listOfAssets List of serial no. (batch) shipped as part of PO
	 * @param {*} transporterCRN Unique CRN of the transporter who will be shipping the drugs to distributor or seller
	 * @access Manufacturer, Distributor
	 * @returns Shipment object created in the network
	 */
	async createShipment(ctx, buyerCRN, drugName, listOfAssets,transporterCRN)
	{

		//Shipment request should be raised by seller , either Manufacturer or Distributor
		this.validateInitiator(ctx, [manufacturerOrg, distributorOrg]);

		const purchaseOrderKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.purchaseOrder', [buyerCRN,drugName]);
		let purchaseOrderBuffer= await ctx.stub.getState(purchaseOrderKey).catch(err => console.log(err));
		let purchaseOrderObject= JSON.parse(purchaseOrderBuffer.toString());

		let assets = [];
		let assetAry = listOfAssets.split(",");

		//NOTE: Considering same drug is shipped with different serial numbers (i.e. batch)
		//If the no. of assets shipped doesn't match with purchase order, reject the request
		if(assetAry.length == purchaseOrderObject.quantity){

			for(let serialN in assetAry){

				//Collect the composite keys of drugs which registered in the network.  If any of the drug and serial no. doesn't present in the network, reject the request
				let drugKey1 = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.drug', [drugName, assetAry[serialN]]);
				let drugBuffer1= await ctx.stub.getState(drugKey1).catch(err => console.log(err));
				let drugObject1 = JSON.parse(drugBuffer1.toString());
				if(drugObject1){
					assets.push(drugKey1);
				}
				else{
					throw new Error("The drug which you are trying to ship is not registered in the network");
				}
			}
		}
		else{
			throw new Error("Your shipment request will not be accepted as the count of drugs " + assetAry.length + "shipped doesn't match with purchase Order "+ purchaseOrderObject.quantity + JSON.stringify(purchaseOrderObject));
		}

		//create composite key for shipment
		const shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.shipment', [buyerCRN, drugName]);

		//In the requirement it's mentioned that composite key for transporter to be created using transporterName and transporterCRN, but we are not receiving transporter name in this method.
		const transporterKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.company', [transporterCRN]);

		let shipmentObject={
			shipmentID: shipmentKey,
			creator: ctx.clientIdentity.getX509Certificate(),
			assets: assets,
			transporter:transporterKey,
			status: 'in-transit',
			createdAt: new Date()
		}

		console.log(shipmentObject);
		
		//Update owner of drug as transporter which are part of shipped.
		for(let i in assets) {
			let drugBuffer= await ctx.stub.getState(assets[i]).catch(err => console.log(err));
			let drugObject= JSON.parse(drugBuffer.toString());
			drugObject.owner = transporterKey;

			let newDrugBuffer = Buffer.from(JSON.stringify(drugObject));
			ctx.stub.putState(assets[i], newDrugBuffer);

		}
		//create new shipment in the network
		let shipmentBuffer = Buffer.from(JSON.stringify(shipmentObject));
		await ctx.stub.putState(shipmentKey, shipmentBuffer);
		return shipmentObject;
	}


	/**
	 * @description Method to update shipment status of PO as 'complete' and owner details of each drug with buyer CRN
	 * @param {*} ctx The transaction context object
	 * @param {*} buyerCRN Unique CRN of buyer who raised PO
	 * @param {*} drugName name of drug
	 * @param {*} transporterCRN Unique CRN of transporter who is shipping the drugs
	 * @access Transporter
	 * @returns Details of each drug
	 */
	async updateShipment(ctx, buyerCRN, drugName, transporterCRN)
	{

		this.validateInitiator(ctx, [transporterOrg]);

		const shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.shipment', [buyerCRN,drugName]);
		let shipmentBuffer= await ctx.stub.getState(shipmentKey).catch(err => console.log(err));
		let shipmentObject= JSON.parse(shipmentBuffer.toString());

		const transporterKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.company', [transporterCRN]);

		//Transporter CRN should be equal as transporter detail available in shipment
		if(shipmentObject.transporter === transporterKey){
			//Update shipment status with 'delivered' status.
			shipmentObject.status = 'delivered';
			shipmentObject.updatedAt = new Date();

			//Update Shipmentkey and owner for each of the drug added into the ledger.
			let assets = shipmentObject.assets;
			let finalOutput = [];
			for (let i in assets) {

				let drugBuffer= await ctx.stub.getState(assets[i]).catch(err => console.log(err));
				let drugObject= JSON.parse(drugBuffer.toString());

				drugObject.shipment = shipmentKey;

				const buyerKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.company', [buyerCRN]);
				let buyerBuffer= await ctx.stub.getState(buyerKey).catch(err => console.log(err));
				let buyerObject= JSON.parse(buyerBuffer.toString());

				console.log("Buyer Organization : " + buyerObject.organisationRole);

				//if buyer is either distributor or retailer, allow to update shipment status.
				if(buyerObject.organisationRole === 'distributor' || buyerObject.organisationRole === 'retailer'){
					drugObject.owner = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.company', [buyerCRN]);
					let drugBuffer = Buffer.from(JSON.stringify(drugObject));
					await ctx.stub.putState(assets[i], drugBuffer);

					finalOutput.push(drugObject);

				}else{
					throw new Error("Invalid buyer information to update shipment status");
				}
			}

			console.log(shipmentObject);

			//Update shipment status as complete
			let shipmentBuffer = Buffer.from(JSON.stringify(shipmentObject));
			await ctx.stub.putState(shipmentKey, shipmentBuffer);
			return finalOutput;

		}
		else{
			throw new Error("You are not allowed to perform this operation");
		}

	}

	/**
	 * @description Method to sell the drug to consumer by retailer
	 * @param {*} ctx The transaction context object
	 * @param {*} drugName Name of the drug
	 * @param {*} serialNo Unique serial no. of drug
	 * @param {*} retailerCRN Unique CRN of retailer who is selling the drug to consumer
	 * @param {*} customerAadhar Name or Aadhar number of the consumer
	 * @access Retailer
	 * @returns Drug details with owner updated as consumer details received as input
	 */
	async retailDrug(ctx, drugName, serialNo,retailerCRN, customerAadhar)
	{

		//Only retailer can sell drug to consumer
		this.validateInitiator(ctx, [retailerOrg]);

		const retailerKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.company', [retailerCRN]);

		const drugKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.drug',[drugName, serialNo]);
		let drugBuffer= await ctx.stub.getState(drugKey).catch(err => console.log(err));
		let drugObject= JSON.parse(drugBuffer.toString());

		//In order to sell drug, current owner of drug should be retailer and retailer CRN should match with the owner details
		if(drugObject.owner == retailerKey){
			
			//Update ownwer as customer adhaar or name
			drugObject.owner = customerAadhar;

			console.log(drugObject);

			let newDrugBuffer = Buffer.from(JSON.stringify(drugObject));
			await ctx.stub.putState(drugKey, newDrugBuffer);

			return drugObject;

		}
		else{
			throw new Error("Only owner of the property can sell the drug to consumer");
		}
	}

	/**
	 * @description Method to get complete history of drug
	 * @param {*} ctx The transaction context object
	 * @param {*} drugName Name of the drug
	 * @param {*} serialNo Unique serial no. for which the history to be pulled
	 * @returns All the transactions associated with the given drug name and serial no.
	 * @access any organisation can retrieve this information.
	 */
	async viewHistory(ctx,drugName, serialNo){

		const drugKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.drug',[drugName, serialNo]);

		let iterator = await ctx.stub.getHistoryForKey(drugKey);

		let allResults = [];

		while (true) {

			let res = await iterator.next();

			if (res.value && res.value.value.toString()) {
				let jsonRes = {};
				console.log(res.value.value.toString('utf8'));

				jsonRes.TxId = res.value.tx_id;
				jsonRes.Timestamp = res.value.timestamp;
				jsonRes.IsDelete = res.value.is_delete.toString();
				try {
				jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
				} catch (err) {
				console.log(err);
				jsonRes.Value = res.value.value.toString('utf8');
				}

				allResults.push(jsonRes);
			}
			if (res.done) {
				console.log('end of data');
				await iterator.close();
				console.info(allResults);
				return allResults;
			}
		}
	}

	/**
	 * @description Method to get current state of the drug
	 * @param {*} ctx The transaction context object
	 * @param {*} drugName Name of the drug
	 * @param {*} serialNo Unique serial no. of drug for which the status to be pulled
	 * @returns Drug details available in the ledger
	 */
	async viewDrugCurrentState(ctx,drugName, serialNo){
		const drugKey = ctx.stub.createCompositeKey('org.pharma-network.com.pharmanet.drug',[drugName, serialNo]);
		let drugBuffer= await ctx.stub.getState(drugKey).catch(err => console.log(err));
		let drugObject= JSON.parse(drugBuffer.toString());

		return drugObject;
	}

}

module.exports = PharmaNetContract;
