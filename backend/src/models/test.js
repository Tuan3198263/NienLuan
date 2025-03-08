const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    receivedData: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Test = mongoose.model("Test", testSchema);

module.exports = Test;
