const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();

const router = require('./api.js');
const client = require('./db.js');

app.use(express.json());
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use('/api/', router);

async function init() {
	await client.connect();
}

const port = process.env.PORT;
app.listen(port, async () => {
	await init();
	console.log("listening on port: ", port);
});
