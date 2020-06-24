# Footr
## About
**Foo**d **tr**acker is a service that allows you to keep track of what food you eat via its GraphQL API. It's currently built for single-user use, i.e. food records and food items aren't bound to any particular user.

## Requirements
You'll need a running instance of MongoDB to store the records. Make sure to save your connection string URI in the `MONGODB_CONNECTION_STRING` environment variable or in the `.env` file. The `.env.example` file serves as an example.
```
# File: .env

MONGODB_CONNECTION_STRING='mongodb://localhost:27017/myapp'
```

## Getting started
### 1. Setup
Clone the repository and install dependencies
```
git clone https://github.com/hajekjiri/footr-backend.git
cd footr-backend
npm install
```

### 2. Running Footr
Simply start the server with `npm run start`.
```
$ npm run start

> footr-backend@1.0.0 start /home/jiri/projects/footr-backend
> node app.js

Apollo Server ready at http://localhost:4000/
Connected to database
```

For development, you'll want to start the server with `npm run server` which starts it with nodemon and reloads it each time you make any changes.
```
$ npm run server

> footr-backend@1.0.0 server /home/jiri/projects/footr-backend
> nodemon app.js

[nodemon] 2.0.4
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node app.js`
Apollo Server ready at http://localhost:4000/
Connected to database
```

### 3. Using Footr
One of the ways you can interact with Footr is the GraphQL Playground which should be located at [http://localhost:4000/graphql](http://localhost:4000/graphql) once you start the server.

## Documentation
Documentation for Footr's GraphQL API can be found on my [GitHub Pages](https://hajekjiri.github.io/footr-backend).

## Used external modules
* [apollographql/apollo-server](https://github.com/apollographql/apollo-server) is licensed under the [MIT License](https://github.com/apollographql/apollo-server/blob/master/LICENSE)
* [Automattic/mongoose](https://github.com/Automattic/mongoose) is licensed under the [MIT License](https://github.com/Automattic/mongoose/blob/master/LICENSE.md)
* [excitement-engineer/graphql-iso-date](https://github.com/excitement-engineer/graphql-iso-date) is licensed under the [MIT License](https://github.com/excitement-engineer/graphql-iso-date/blob/master/LICENSE)
* [motdotla/dotenv](https://github.com/motdotla/dotenv) is licensed under the [BSD-2-Clause License](https://github.com/motdotla/dotenv/blob/master/LICENSE)
