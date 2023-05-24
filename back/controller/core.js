const { body, param, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const db = require("../db.js").db("Medicare");

function authError (res, e) {
	return res.status(403).json({ error: e });
}

//todo: protect against csrf by looking at referrer header? idk

// Authenticates a user based on session token/cookie & claimed username
exports.authenticator = async (req, res, next) => {
	console.log("authenticating..");

	const cookie = req.signedCookies['session-tok'];
	console.log(cookie)
	if (!cookie)
		return res.status(401).json({ error: "Invalid cookie"});

	//find user in db
	let user = await db.collection("users").findOne({ name: cookie });
	console.log(user)
	if (!user) 
		return res.status(401).json({ error: "User with that name not found"});

	delete user.password; 
	req.body.user = user;

	console.log("authenticated.");
	next();
};

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
		const user = req.body.user;
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

	const filter = { _id: user._id };
	const update = {
		$set: {	
			profileId: id
		}
	};
	await db.collection("users").updateOne(filter, update);

	return id; 
}

// Passes only if is self 
exports.isSelf = [
	param("userId")
		.exists()
		.isString()
		.withMessage("No 'userId' parameter"),
	async (req, res, next) => {
		const user 	 = req.body.user;
		const userId = req.body.userId;
		if (user._id.toString() == userId) 
			return next();
		else 
			return authError(res, "Not self");
	}
];

// Passes only if is provider.
exports.isProvider = [
	param("userId")
		.exists()
		.isString()
		.withMessage("No 'userId' parameter"),
	async (req, res, next) => {
		const userId = req.params.userId;
		const user   = req.body.user;
		if (user.patient == true) 
			return authError(res, "Not a provider");

		// Get profile
		const profile = await db.collection("profiles").findOne({ userId: new ObjectId(userId) });
		if (!profile) 
			return authError(res, "None such user");
		if (profile.patient == false) 
			return authError(res, "Target user is a provider");

		// If not in provider list
		if (!profile.providers || profile.providers.filter(p => p.equals(user._id)).length == 0)
			return authError(res, "Not a provider of target user" );

		console.log("identified as provider");
		next();
	}
];

// Passes only if is provider or is self
exports.isSelfOrProvider = [
	param("userId")
		.exists()
		.isString()
		.withMessage("No 'userId' parameter"),
	async (req, res, next) => {
		const userId = req.params.userId;
		const user   = req.body.user;
		if (user._id.toString() == userId) 
			return next();

		if (user.patient == true) 
			return authError(res, "Not a provider");

		// Get profile
		const profile = await db.collection("profiles").findOne({ userId: new ObjectId(userId) });
		if (!profile) 
			return authError(res, "None such user");
		if (profile.patient == false) 
			return authError(res, "Target user is a provider");

		// If not in provider list
		if (!profile.providers || profile.providers.filter(p => p.equals(user._id)).length == 0)
			return authError(res, "Not a provider of target user" );

		console.log("identified as provider");
		next();
	}
];
