const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    owner: { type: String, required: true, default: "test-user" }
});

module.exports = mongoose.model('Todo', todoSchema);