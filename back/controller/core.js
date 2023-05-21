const { body, param, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const db = require("../db.js").db("Medicare");

// Authenticates a user based on session token/cookie & claimed username
exports.authenticator = [
	body("user.name")
		.exists()
		.isString()
		.withMessage("No user name claims found."),
	body("user.id")
		.exists()
		.isString()
		.withMessage("No user id claims found."),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) 
			return res.status(400).json({ errors: errors.array() });

		console.log("authenticating..");

		const cookie = req.signedCookies['session-tok'];
		if (!cookie || cookie != req.body.user.name)
			return res.status(401).json({ error: "Invalid cookie"});

		console.log("authenitcated.");
		next();
	}
];

// Authorizes only if the user is in the given thread
exports.inThread = [
	param("threadId") 
		.exists()
		.isString()
		.withMessage(`No thread ID not found`),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) 
			return res.status(400).json({ errors: errors.array() });
		
		// Get thread
		const threadId = req.params.threadId;
		const filter = {_id: new ObjectId(threadId)}
		const thread = await db.collection("threads").findOne(filter);
		if (!thread) 
			return res.status(404).send(`None such thread ${threadId}`);
			
		// Check if in thread
		console.log(`checking if in thread ${thread.name}`);
		const query = {_id: new ObjectId(req.body.user.id)}; 
		const user = await db.collection("users").findOne(query);


		if (!user.threads || user.threads.filter(id => thread._id.equals(id)).length == 0)  
			return res.status(403).send(`Not in thread ${thread.name}`);

		console.log("confirmed in thread.");
		next();
	}
];

// Creates an empty profile for a given user. called on register.
exports.makeProfileFor = async user => {
	const profile = {
		userId: user._id,
		patient: user.patient,
	};
	const id = (await db.collection("profiles").insertOne(profile)).insertedId;
	console.log(`created profile for user named ${user.name}`);

	return id; 
}
