const { body, validationResult } = require('express-validator');
const db = require("../db.js").db("Medicare");

// Authenticates a user based on session token/cookie & claimed username
exports.authenticator = [
	body("user.name")
		.exists()
		.isString()
		.withMessage("No user claims found."),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) 
			return res.status(400).json({ errors: errors.array() });

		console.log("authenticating..");

		console.log(req.cookies);
		console.log(req.signedCookies);
		const cookie = req.signedCookies['session-tok'];
		if (!cookie || cookie != req.body.user.name)
			return res.status(401).end();

		console.log("authorized.");
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


