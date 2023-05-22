const { MongoClient } = require("mongodb");
require("dotenv").config();

// Replace the uri string with your connection string.
const uri = process.env.CONNECTION_URI;
//console.log(uri);

const client = new MongoClient(uri);
module.exports = client;
