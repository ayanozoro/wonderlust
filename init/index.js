const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

main().then(() => {
    console.log("connection is successful");
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.create(initData.data);
    console.log("data is initialized");
}

initDB();

