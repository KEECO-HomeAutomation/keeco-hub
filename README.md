# keeco-hub



[![ci](https://ci.systemtest.tk/badge/3)](https://ci.systemtest.tk/repo/3)
[![bucket](https://img.shields.io/badge/-Build%20Bucket-yellow.svg)](http://s.go.ro/s2qh8vv7)

The central software which orchestrates all the hardware nodes and provides an API for the client access.



## NPM Scripts

- _npm start_ : start the application in development mode, with automatic reloading (see caveats in CONTRIBUTING.md)
- _npm run build_ : Compile the code with babel (output directory: _build_)
- _npm test_ : Run all the tests
- _npm run test:coverage_ : Run all the tests and generate coverage reports
- _npm run lint_ : Lint your code. It will also error out on format errors
- _npm run format_ : Format every _.js_ file using Prettier.



## Which is which

- _src/index.js_ : The entrypoint of the hub. It just initializes every module.
- _src/aedes_ : The home of the MQTT server
- _src/apollo_ : The home of the GraphQL server
	- _index.js_ : Sets up the server
	- _schema_ : Contains the GQL schema
		- _index.js_ : Merges all the typeDefs and resolvers
		- _Query_ : The base query which is extended
			- _schema.graphql_ : The main schema
			- _resolvers.js_ : The main resolvers
		- ... (so on for the rest of the directories)
- _src/sqlite_ : The home of the SQLite instance
	- _index.js_ : Sets up the database
	- _populate.js_ : Populates the empty database on the first start
	- _structure.js_ : Contains the structure of the SQLite database
- _src/connector_ : The home of the class that connects and controlls all the different data stores and APIs
	- _index.js_ : The base class which imports all the modules
	- The rest of the files are modules of the connector
- _src/utils_ : Contains utility functions



## Auto provisioning

Provision JSONs should be passed to the MQTT server as the username. Password is omitted in this case.

Example provision JSON:
```json
{
	"uuid": "5e35d62e-a832-41fe-9660-3768c427addc",
	"name": "KEECO Switch",
	"endpoints": [
		{
			"name": "relayPin1",
			"output": true,
			"range": "0,1"
		},
		{
			"name": "relayPin2",
			"output": true,
			"range": "0,1"
		}
	],
	"templates": [
		{
			"name": "switch",
			"mappings": [
				{
					"name": "on",
					"endpoint": "relayPin1"
				}
			]
		},
		{
			"name": "switch",
			"mappings": [
				{
					"name": "on",
					"endpoint": "relayPin2"
				}
			]
		}
	]
}
```

Provision JSON fields:
- _uuid_ : Mandatory field. Should be universally unique
- _name_ : The node can name itself. This can be changed later by the user. _Optional_
- _endpoints_ : Array of endpoints
	- _name_ : The name of the pin. Should be unique per node
	- _output_ : Set to true if the pin is an output pin. _Optional. If omitted defaults to false_
	- _range_ : The node can define what values is it accepting/will it produce. Examples: 0:15, .002:.4, 1,2,3. [See more](https://www.npmjs.com/package/number-ranger). _Optional_
- _templates_ : Array of templates. The templates are which tell the server how to work with a node. _Required, but can be an empty array_
	- _name_ : Name of the template. Should match one of the names listed in _src/apollo/schema/nodes/TemplateData.graphql_. For example the template name for TemplateDataSwitch should be switch. __Case sensitive__
	- _mappings_ : Mappings for the template
		- _name_ : The name of the pin that should be present for the selected template. __Case sensitive__
		- _endpoint_ : The name of the endpoint that is mapped to the template pin