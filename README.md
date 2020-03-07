

Pharma Network

Smart Contract Solution Document

Manufacture, Distribute and Retail the drug in smart and secure way
Saikumar K

2/17/2020



Document contains step by step guide to user who would like to understand different methods available implemented in the smart contracts and execute to understand the output.


 
Introduction
Pharma network is a platform where manufacturer can manufacture a drug and take it to consumer in a secure and smart way.  In this document we will going through below topics which will help you to understand various functionalities available in this network. 
•	Setup HyperLedger network which create docker containers for various organization involved in this network 
•	Setup node module which allows client application to execute various methods available in the smart contract
•	Execute each method through postman 
Pre-requisites
These smart contracts were developed using the VM provided by Upgrad which contains necessary software for deploying and executing smart contracts. 
Step 1-A: Bootstrap the network	
Command:
1.	Locate ‘network’ folder under ‘pharma-net’ folder of the project
2.	Execute the command ./fabricNetwork.sh up, which will prompt for the confirmation to boot the network. Enter ‘Y’ in the terminal to bring up the network.
Terminal Screenshot: 

 
 
Step 1-B: Start the chaincode node application
This is needed only for the first time when you setup the network to have necessary node modules are available inside chaincode folder to instantiate smart contract.
Command: 
1.	Enter into docker container for chaincode using command docker exec -it chaincode /bin/bash
2.	Install node modules using ‘npm install’ command which will install all necessary Node modules inside chaincode container. 
3.	Start the node application: npm run start-dev
 
 
Step 1-C: Chaincode Installation and Instantiation
Command: 
1.	Once Step 1-B is complete, execute below command under ‘network’ folder which will install & instantiate the smart contracts in chaincode container and allow us to invoke different methods listed below. 
2.	./fabricNetwork.sh install
Terminal 
 
 
 
Step 2: Start the chaincode node application
This is a must have step before proceeding to Step 4
Command: 
4.	Go to ‘application’ folder available in ‘pharma-net’ folder. 
5.	Install node modules using ‘npm install’ command which will install all necessary Node modules required to configure the API URLs to be called by client application. 
6.	Start the node application: node .
Terminal: 
 
 
 
Step 3: Invoke Smart Contract through REST API
Initiation Collection
addToWallet
In order to create each organization into the wallet, we need to have two files. In postman script, replace public and private key for each of the organization before executing ‘addToWallet’ method. 
Public Key
Transporter: /home/upgrad/workspace/pharma-net/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/signcerts/Admin@transporter.pharma-network.com-cert.pem
Manufacturer: /home/upgrad/workspace/pharma-net/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/signcerts/Admin@manufacturer.pharma-network.com-cert.pem 
Retailer: /home/upgrad/workspace/pharma-net/network/crypto-config/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/signcerts/Admin@retailer.pharma-network.com-cert.pem
Distributor: /home/upgrad/workspace/pharma-net/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/signcerts/Admin@distributor.pharma-network.com-cert.pem
Private Key
Go to below folder for each of the organization and replace the highlighted value. 
Transporter: /home/upgrad/workspace/pharma-net/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/keystore/ 5f2b1842c284acb31320b2c4c8c54af75ed73ead88e49a46f1210f97c9e8f1de_sk
Manufacturer: /home/upgrad/workspace/pharma-net/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/keystore/ 4aa55d693d4828416a38510e6336af47bc046977b916433f64e6994b4917fc10_sk
Retailer: /home/upgrad/workspace/pharma-net/network/crypto-config/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/keystore/ 706eadd3b87e0945e663c19f42b8df99d68d4b2d2a3a367b97be945c063d6ed5_sk
Distributor: /home/upgrad/workspace/pharma-net/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/keystore/ fe1faa1b5c31776fae4e8ab50f0b5610b704b783a53b9ce661e1f47ee873a529_sk
Postman script for each organization: (can be found under ‘test’ folder)
Distributor: distributer-addToWallet
Manufacturer: manufacturer-addToWallet
Retailer: retailer-addToWallet
Transporter: transporter-addToWallet
Screenshot of Postman script execution: 
   
Register Company
For each of the company, we need to execute registerCompany method to perform the required operation for below mentioned other modules. 
Postman script for each company: (scripts under initiation collection)
•	Manufacturer: manufacturer-sunpharma-registerCompany
•	Distributor: distributor-VGPharma-registerCompany
•	Retailer: retailer-upgrad-registerCompany
•	Transporter1: transporter-fedex-registerCompany
•	Transporter2: transporter-bluedart-registerCompany
Screenshot of postman script execution: 
 
 
addDrug

Below mentioned postman scripts can be used to add 4 drugs in the network
Post man scripts (found under initiation collection)
•	Drug 1: manufacturer-Paracetamol-001-addDrug
•	Drug 2: manufacturer-Paracetamol-002-addDrug
•	Drug 3: manufacturer-Paracetamol-003-addDrug
•	Drug 4: manufacturer-Paracetamol-004-addDrug
Screenshot of postman script execution: 
 
 
Supply Chain Collection

Below post man scripts to be executed for each of the functions mentioned below.  These postman scripts can be found under ‘Supply Chain’ collection.
Method Mapping
Method	Functionality	Postman script
SC1	Create PO by Distributor	part-a-1-distributor-createPO
SC2	Create shipment by Manufacturer	part-a-2-manufacturer-createShipment
SC3	Update Shipment by Transporter1	part-a-3-transporter-updateShipment
SC4	Create PO by Retailer	part-b-1-retailer-createPO
SC5	Create shipment by Distributor	part-b-2-distributor-createShipment
SC6	Update shipment  by Transporter 2	part-b-3-transporter-updateShipment
SC7	Retail drug by Retailer	part-c-1-retailer-retailDrug

Screenshot of postman execution: 
Method: SC1
 
Method: SC2
 
Method: SC3
 
 
Method: SC4
 
Method: SC5
 
 
Method: SC6
 
Method : SC7
 

 
History
viewHistory
 
 
viewDrugCurrentState
 

