# Monday API Experiment

Read a few columns of data for course coverage information from a Monday board.

Monday uses a GraphQl api. The idea of this project was to create a bare minimum project that just reads some data from a given Monday board id. The monday specific api calls are located in:  
`monday-api.ts`  
It's broken down into some smaller pieces so  that the function `getBoardData()` can be easily reused by just specifying a different `inserts` parameter. While the package.json loads a number of packages they are mostly for testing and TypeScript type support. The only external packages used are `axios` and `dotenv`. We store our Monday token secret in the .env file and don't make it part of the github project. See `env-example` for the needed enviroment variable name.

Running `npm start` from the command line is all that's needed to test if things are working.