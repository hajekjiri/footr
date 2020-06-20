const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
} = require('graphql');

const HelloType = new GraphQLObjectType({
  name: 'Hello',
  fields: () => ({
    message: {type: GraphQLString}
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    hello: {
      type: HelloType,
      resolve(parent, args) {
        return {message: "Hi there!"};
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
