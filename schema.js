const bcrypt = require('bcrypt');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const {
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLBoolean,
} = require('graphql');

const User = require('./models/User');
const NurseVitalSigns = require('./models/NurseVitalSigns'); 
const DailyPatientInfo = require('./models/DailyPatientInfo');
const SymptomChecklist = require('./models/SymptomChecklist'); 

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID)},
    name: { type: GraphQLNonNull(GraphQLString)},
    email: { type: GraphQLNonNull(GraphQLString)},
    role: { type: GraphQLNonNull(GraphQLString) },
    token: { type: GraphQLString }, 
  }),
});

const DailyPatientInfoType = new GraphQLObjectType({
  name: 'DailyPatientInfo',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    userId: { type: GraphQLNonNull(GraphQLID)},
    pulseRate: { type: GraphQLInt },
    bloodPressure: { type: GraphQLString },
    weight: { type: GraphQLFloat },
    temperature: { type: GraphQLFloat },
    respiratoryRate: { type: GraphQLInt },
    createdAt: { type: GraphQLString },
  }),
});

const NurseVitalSignsType = new GraphQLObjectType({
  name: 'NurseVitalSigns',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID)},
    userId: { type: GraphQLNonNull(GraphQLID) },
    patientName: { type: GraphQLString }, 
    bodyTemperature: { type: GraphQLFloat },
    heartRate: { type: GraphQLInt },
    bloodPressure: { type: GraphQLString }, 
    respiratoryRate: { type: GraphQLInt },
    createdAt: { type: GraphQLString }, 
  }),
});

const SymptomChecklistType = new GraphQLObjectType({
  name: 'SymptomChecklist',
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
    fever: { type: GraphQLBoolean },
    cough: { type: GraphQLBoolean },
    shortnessOfBreath: { type: GraphQLBoolean },
    soreThroat: { type: GraphQLBoolean },
    musclePain: { type: GraphQLBoolean },
    lossOfTasteOrSmell: { type: GraphQLBoolean },
    fatigue: { type: GraphQLBoolean },
    diarrhea: { type: GraphQLBoolean },
    nauseaOrVomiting: { type: GraphQLBoolean },
    submittedAt: { type: GraphQLString },
  }),
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const user = await User.findOne({ email: args.email });
        if (user) {
          throw new Error('Email in use');
        }
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(args.password, salt);
        const newUser = new User({
          name: args.name,
          email: args.email,
          password: hashedPassword,
          role: args.role,
        });
        const result = await newUser.save();
        const token = jwt.sign({ id: result.id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        return { ...result._doc, id: result._doc._id, token };
      },
    },
    loginUser: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        try {
          const user = await User.findOne({ email: args.email });
          if (!user) {
            throw new Error('Invalid Credentials');
          }
          const passwordCheck = await bcrypt.compare(args.password, user.password);
          if (!passwordCheck) {
            throw new Error('Invalid Credentials');
          }
          const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
          return { ...user._doc, id: user._doc._id, token };
        } catch (error) {
          console.error(error);
          throw new Error('Invalid Credentials');
        }
      },
    },
    addNurseVitalSigns: {
      type: NurseVitalSignsType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        patientName: { type: GraphQLString },
        bodyTemperature: { type: GraphQLFloat },
        heartRate: { type: GraphQLInt },
        bloodPressure: { type: GraphQLString },
        respiratoryRate: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const user = await User.findById(args.userId);
        
        if (!user) {
          throw new Error('Invalid User - User does not exist');
        } else if (user.role !== 'nurse') {
          throw new Error('Invalid user - role nurse needed');
        }
        
        const newNurseVitalSigns = new NurseVitalSigns({
          userId: args.userId,
          patientName: args.patientName,
          bodyTemperature: args.bodyTemperature,
          heartRate: args.heartRate,
          bloodPressure: args.bloodPressure,
          respiratoryRate: args.respiratoryRate,
          createdAt: new Date().toISOString(),
        });
        
        return await newNurseVitalSigns.save();
      },
    },
    addDailyPatientInfo: {
      type: DailyPatientInfoType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        pulseRate: { type: GraphQLInt },
        bloodPressure: { type: GraphQLString },
        weight: { type: GraphQLFloat },
        temperature: { type: GraphQLFloat },
        respiratoryRate: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const user = await User.findById(args.userId);
        if (!user) {
          throw new Error('Invalid User - User does not exist');
        } else if (user.role === 'nurse') {
          throw new Error('Invalid user - role patient needed');
        }
        const newDailyPatientInfo = new DailyPatientInfo({
          ...args,
          createdAt: new Date().toISOString(),
        });

        return await newDailyPatientInfo.save();
      },
    },
    submitSymptoms: {
      type: SymptomChecklistType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        fever: { type: GraphQLBoolean },
        cough: { type: GraphQLBoolean },
        shortnessOfBreath: { type: GraphQLBoolean },
        soreThroat: { type: GraphQLBoolean },
        musclePain: { type: GraphQLBoolean },
        lossOfTasteOrSmell: { type: GraphQLBoolean },
        fatigue: { type: GraphQLBoolean },
        diarrhea: { type: GraphQLBoolean },
        nauseaOrVomiting: { type: GraphQLBoolean },
      },
      resolve: async (parent, { userId, fever, cough, shortnessOfBreath, soreThroat, musclePain, lossOfTasteOrSmell, fatigue, diarrhea, nauseaOrVomiting }) => {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found.');
        } else if (user.role !== 'patient') {
          throw new Error('Only users with the role of patient can submit symptoms.');
        }
  
        const newSymptomSubmission = new SymptomChecklist({
          userId,
          fever,
          cough,
          shortnessOfBreath,
          soreThroat,
          musclePain,
          lossOfTasteOrSmell,
          fatigue,
          diarrhea,
          nauseaOrVomiting,
          submittedAt: new Date(),
        });
    
        return await newSymptomSubmission.save();
      },
    },
  },
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return User.findById(args.id);
      },
    },
    nurseVitalSigns: {
      type: new GraphQLList(NurseVitalSignsType),
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, { userId }) => {
        const user = await User.findById(userId);
        if (!user || user.role !== 'nurse') {
          throw new Error('Invalid user - user role nurse required');
        }
        
        return NurseVitalSigns.find({ userId });
      },
    },
    viewDailyPatientInfo: {
      type: new GraphQLList(DailyPatientInfoType),
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, { userId }) => {
        const user = await User.findById(userId);
        if (!user || user.role !== 'patient') {
          throw new Error('Invalid user - user role patient required');
        }
        
        return DailyPatientInfo.find({ userId });
      },
    },
    viewSymptoms: {
      type: new GraphQLList(SymptomChecklistType),
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, { userId }) => {
        const user = await User.findById(userId);

        if (!user || user.role !== 'patient') {
          throw new Error('Invalid user - user role patient required');
        }
        
        return SymptomChecklist.find({ userId });
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
