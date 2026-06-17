const mongoose = require('mongoose');

const WrongAttemptSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    questionNo: {
        type: Number,
        required: true
    },
    ques: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    studentAnswer: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    marks: {
        type: Number,
        default: 0
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const WrongAnswerSchema = new mongoose.Schema({
    testId: {
        type: String,
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        default: null
    },
    unattemptedCount: {
        type: Number,
        default: 0
    },
    unattemptedQuestionNos: {
        type: [Number],
        default: []
    },
    wrongAttempts: {
        type: [WrongAttemptSchema],
        default: []
    }
}, { timestamps: true, collection: 'wrong_keys' });

module.exports = mongoose.model('WrongAnswer', WrongAnswerSchema);