# Contributing



## Code Style

We use the [Prettier](https://prettier.io) code style as defined in _.prettierrc.json_.
```
{
	"semi": true,
	"useTabs": true,
	"singleQuote": true
}
```
Your code __MUST__ be formatted respecting these styles. You can use IDE extensions (for example _jsPrettier_ for sublime), or you can use the included script (`npm run format`), which formats every JS file.



## Branches

The _master_ and _dev_ branches are protected.
The _master_ branch contains the well tested code that is ready to be released. Each release is tagged.
The _dev_ branch is used for development.
Each feature must have it's own branch prefixed with __feature/__ (for eample: feature/userMutations). When the work is finished you have to file a Pull Request which will be reviewed by one of the code owners. During the review the reviewer __MUST__ check the results of the CI tests and the compliance of naming conventions. After merging the feature branch it will be removed from the origin repository.



## Testing

You should write tests for every unit. Every feature of the unit should be covered by tests. You can check your test coverage by running `npm run test:coverage`.
We are using [jest](https://jestjs.io/) for testing.
The tests files should be placed near the tested filed with the _.test.js_ extension (for example: _epicFeature.js_ should have a test file called _epicFeature.test.js_).



## Tools

During development you can test the GraphQL server using the included playground that can be found at _http://localhost:5000_. Or you can use [GraphiQL](https://electronjs.org/apps/graphiql). The endpoint is _http://localhost:5000/graphql_.
You can test MQTT functionality with [MQTT.fx](https://mqttfx.jensd.de/). The default settings should work there.



## Caveats

Due to limitations when modifying _.graphql_ files the application won't reload. You have to kill it with `Ctrl + C`, clear the _node_modules/.cache/babel-loader_ directory and start it back again. Or you make a small modification (for example adding a new line at the end of the file) in _src/apollo/schema/index.js_ and everything will be reloaded automatically. Just make sure you revert your changes afterwards.