// require('dotenv').config()
// const express = require('express')
// const app = express()
// const mongoose = require('mongoose')    
// //import {graphqlHTTP} from 'express-graphql'
// const expressGraphQL = require('express-graphql').graphqlHTTP
// const {
//   GraphQLSchema,
//   GraphQLObjectType,
//   GraphQLString,
//   GraphQLList,
//   GraphQLInt,
//   GraphQLNonNull
// } = require('graphql')
// const Employee = require('./models/employee')

// mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
// const db = mongoose.connection
// db.on('error', (error) => console.error(error))
// db.once('open', () => console.log('Connected to Database'))


// const EmployeeType = new GraphQLObjectType({
//     name: 'Employee',
//     description: 'This represents a employee to the app',
//     fields: () => ({
//       _id: { type: GraphQLNonNull(GraphQLString) },
//       name: { type: GraphQLNonNull(GraphQLString)  },
//       email: { type: GraphQLNonNull(GraphQLString) },
//       role: { type: GraphQLNonNull(GraphQLString) },
//       department: { type: GraphQLNonNull(GraphQLString) },
//     })
//   })

//   const RootQueryType = new GraphQLObjectType({
//     name: 'Query',
//     description: 'Root Query',
//     fields: () => ({
//       employee: {
//         type: EmployeeType,
//         description: 'A Single Employee',
//         args: {
//           _id: { type: GraphQLString }
//         },
//         resolve: async (parent, args) => {
//             let employee
//             employee = await Employee.findById(args._id)
//            return employee;

//         }
//       },
//       employees: {
//         type: new GraphQLList(EmployeeType),
//         description: 'List of All Employees',
//         resolve: async () => {
//            const employees = await Employee.find();
//             return employees;         
//         }
//       }
//     })
//   })

//   const RootMutationType = new GraphQLObjectType({
//     name: 'Mutation',
//     description: 'Root Mutation',
//     fields: () => ({
//       addEmployee: {
//         type: EmployeeType,
//         description: 'Add a Employee',
//         args: {
//           name: { type: GraphQLNonNull(GraphQLString)  },
//           email: { type: GraphQLNonNull(GraphQLString) },
//           role: { type: GraphQLNonNull(GraphQLString) },
//           department: { type: GraphQLNonNull(GraphQLString) }
//         },
//         resolve: async (parent, args) => {
//           const employee = new Employee({
//             name: args.name,
//             email: args.email,
//             role: args.role,
//             department: args.department,
//           });
//           const newEmployee = await employee.save();
//           return newEmployee;

//         }
//       },
//       deleteEmployee:{
//         type: EmployeeType,
//         description: 'Delete a Employee',
//         args: {
//           _id: { type: GraphQLNonNull(GraphQLString)  },
//         },
//         resolve: async (parent, args) => {
//             const deleted = await Employee.findByIdAndDelete(args._id);
//             return deleted;
    
//       }
//       },
//       updateEmployee: {
//         type: EmployeeType,
//         description: 'Update a Empoyee',
//         args: {
//           _id: { type: GraphQLNonNull(GraphQLString) },
//           name: { type: GraphQLNonNull(GraphQLString) },
//           email: { type: GraphQLNonNull(GraphQLString) },
//           role: { type: GraphQLNonNull(GraphQLString) },
//           department: { type: GraphQLNonNull(GraphQLString) },
//         },
//         resolve: async (parent, args) => {
//           try {
//             const updated = await Employee.findByIdAndUpdate(
//               args._id,
//               { $set: { 
//                 name: args.name,
//                 email: args.email,
//                 role: args.role,
//                 department: args.department,
//               }},
//               { new: true }
//             );
//             if (!updated) {
//               throw new Error('Empoyee not found');
//             }
//             return updated;
//           } catch (error) {
//             throw new Error(`Failed to update updated: ${error.message}`);
//           }
//         }
//       }
//     })
//   })

// const schema = new GraphQLSchema({
//     query: RootQueryType,
//     mutation: RootMutationType
//   })

// app.use(express.json())
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS, GET, POST, PUT, PATCH, DELETE"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });
// app.use('/employees', expressGraphQL({
// schema: schema,
// graphiql: true
// }));


// app.listen(8000, () => console.log('Server Started'))