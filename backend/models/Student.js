const mongoose = require('mongoose');



const studentSchema = new mongoose.Schema({

    name: {

        type: String,

        required: true

    },

    emailID: {

        type: String,

        required: true,

        unique: true,

        match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Please fill a valid gmail address']

    },

    password: {

        type: String,

        required: false

    },

    profilePicture: {

        type: String,

        default: ''

    },

    scores: {

        type: [Number],

        default: []

    },

    testId: {

        type: [String],

        default: []

    },

    alarm: {

        type: [Number],

        default: []

    },

    activeAlarmByTest: {

        type: Map,

        of: Number,

        default: {}

    },



}, { timestamps: true });



module.exports = mongoose.model('Student', studentSchema);

