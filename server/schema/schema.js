const {
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLScalarType,
} = require("graphql");
const { Kind } = require("graphql/language");
const Book = require("../models/Book.model");
const Author = require("../models/Author.model");
const User = require("../models/User.model");

const DateType = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.getTime();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert AST integer to Date type
    }
    return null;
  },
});

const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    pages: { type: GraphQLInt },
    isDeleted: { type: GraphQLBoolean },
    yearOfPublication: { type: DateType },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        return Author.findById(parent.author);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    age: { type: GraphQLString },
    isDeleted: { type: GraphQLBoolean },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        return Book.find({ author: parent.id });
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    profilePicture: { type: GraphQLString },
    phone: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    findBookById: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Book.findById(args.id).populate("author");
      },
    },
    getbooks: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        return Book.find({ isDeleted: false }).populate("author");
      },
    },
    findAuthorById: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Author.findById(args.id).populate("books");
      },
    },
    getAuthors: {
      type: new GraphQLList(AuthorType),
      resolve(parent, args) {
        return Author.find({ isDeleted: false }).populate("books");
      },
    },
    getUserById: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args) {
        const isUser = await User.findById(args.id);
        if (!isUser) throw new Error("could not find user by the provided id");
        return isUser;
      },
    },
    getUsers: {
      type: new GraphQLList(UserType),
      async resolve(parent, args) {
        return await User.find({ isDeleted: false });
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createBook: {
      type: BookType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        pages: { type: new GraphQLNonNull(GraphQLInt) },
        author: { type: new GraphQLNonNull(GraphQLID) },
        yearOfPublication: { type: new GraphQLNonNull(DateType) },
      },
      async resolve(parent, args) {
        const newBook = new Book({
          title: args.title,
          pages: args.pages,
          author: args.author,
          yearOfPublication: args.yearOfPublication,
        });

        const savedBook = await newBook.save();
        const publisher = await Author.findById(args.author);
        if (!publisher) throw new Error("could not find the author specified");
        if (publisher.books.length < 1) {
          publisher.books.push(newBook._id);
        } else {
          publisher.books.unshift(newBook._id);
        }
        await publisher.save();
        return savedBook;
      },
    },
    updateBook: {
      type: BookType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        pages: { type: GraphQLInt },
        author: { type: GraphQLID },
      },
      resolve(parent, args) {
        return Book.findByIdAndUpdate(
          args.id,
          {
            $set: {
              title: args.title,
              pages: args.pages,
              author: args.author,
            },
          },
          { new: true }
        );
      },
    },
    deleteBook: {
      type: BookType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return Book.findById(args.id)
          .then((book) => {
            if (!book) {
              throw new Error("Book not found");
            }
            book.isDeleted = !book.isDeleted;
            return book.save();
          })
          .catch((error) => {
            throw new Error("Error deleting book: " + error.message);
          });
      },
    },
    updateAuthor: {
      type: AuthorType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        age: { type: GraphQLInt },
      },
      resolve(parent, args) {
        return Author.findByIdAndUpdate(
          args.id,
          {
            $set: {
              firstName: args.firstName,
              lastName: args.lastName,
              email: args.email,
              age: args.age,
            },
          },
          { new: true }
        );
      },
    },
    deleteAuthor: {
      type: AuthorType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return Author.findById(args.id)
          .then((author) => {
            if (!author) {
              throw new Error("Author not found");
            }
            author.isDeleted = !author.isDeleted;
            return author.save();
          })
          .catch((error) => {
            throw new Error("Error deleting author: " + error.message);
          });
      },
    },
    createAuthor: {
      type: AuthorType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        const newAuthor = new Author({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          age: args.age,
        });
        return newAuthor.save();
      },
    },
    registerUser: {
      type: UserType,
      args: {

      },
      resolve(parent, args) {
        
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
