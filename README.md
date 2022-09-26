
## Setup
Import collections under the DB folder into MongoDB (I used Compass)
DB name: 
```shell
Newsllet 
```
Collections are named as their .json files (Domains,Filters,Matches,Patterns)

## Installation
```shell
npm install
```
P.S. my node version is v14.19.1 - but I don't think you'll have problems with other versions

## Run
```shell
tsc && npm start
```
Note: I have typescript installed globally so 'tsc' is enough for me - if you don't, a local version of typescript would be installed regardless - to run the comand it may be different - I think it's 'npx tsc'

This will spinup the backend server listening on port 4000 and the default port for MongoDB 27017

Hmm.. I think that's all - you should see the app working

## REST API

I've exported the Postman collection I've used to test this - API.postman_collection.json - import it into Postman and feel free to change the parameters (in fact please do - some of them are already used and persisted (take a look at the DB) - Regardless you shouldn't be able to break the system - even if you send wrong parameters)

## WebSocket API

Sadly Postman doesn't allow me to export that collection, but it's simple so I'll just write it here.

Connect to:
```shell
ws://localhost:4000
```
You subscribe to a given filter by sending the filterID (mongoDB objectID) through the socket
Example
```shell
6329d740d4381eae957bf59e
```