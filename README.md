# keeco-hub



[![badge](https://ci.systemtest.tk/badge/3)](https://ci.systemtest.tk/repo/3)

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