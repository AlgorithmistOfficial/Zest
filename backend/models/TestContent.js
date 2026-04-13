const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    ques: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['single option answer', 'multiple option answer', 'value enter answer', 'write code answer'],
        required: true
    },
    options: [{
        type: String
    }], // Only used for 'single option answer' and 'multiple option answer'
    testCases: [{
        input: String,
        output: String
    }], // Only used for 'write code answer'
    marks: {
        type: Number,
        required: true,
        default: 1
    },
    answerKey: {
        type: mongoose.Schema.Types.Mixed, // Can be array (for multi option) or string
        required: function() { return this.type !== 'write code answer'; }
    }
});

const TestContentSchema = new mongoose.Schema({
    testId: {
        type: String,
        required: true,
        unique: true
    },
    questions: [QuestionSchema]
}, { timestamps: true });

module.exports = mongoose.model('TestContent', TestContentSchema);
