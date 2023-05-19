const db = require("../db.js").db("Medicare");
const { body, validationResult } = require('express-validator');

/* 
Fetch Tester:

# Register:
fetch("http://localhost:3030/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "le bron james",
        age: 69,
        password: "1234"
    })
});

# Login:
fetch("http://localhost:3030/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "le bron james",
        password: "1234"
    })
});

# Logout (clear cookie):
fetch("http://localhost:3030/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: {
        name: "le bron james",
    }})
})

# Test of authorized 
fetch("http://localhost:3030/api/secret", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: {
        name: "le bron james",
    }})
}).then(res => res.json()).then(console.log)
 */

exports.authenticator = [
	body("user.name")
		.exists()
		.isString()
		.withMessage("No user claims found."),
	async (req, res, next) => {
		console.log(req.body);
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

exports.register = [
	body("name")
		.exists()
		.isString()
		.withMessage("Invalid name"),
	body("age")
		.exists()
		.isInt()
		.withMessage("Invalid age"),
	body("password")
		.exists()
		.isString()
		.withMessage("Invalid password"),
	async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) 
            return res.status(400).json({ errors: errors.array() });
        

		console.log("registering..");	
		const users = db.collection('users');

		const b = req.body;
		const user = {
			name: 	b.name,
			age: 	b.age,
			password: 	b.password
		};

		// If user already exists
		if (await users.findOne({name: user.name}) != null) 
			return res.status(400).send(`User named '${user.name}' already exists.`);

		// Insert to DB
		await users.insertOne(user);

		return res.status(201);
	}
];

exports.login = [
	body("name")
		.exists()
		.isString()
		.withMessage("Invalid name"),
	body("password")
		.exists()
		.isString()
		.withMessage("Invalid password"),
	async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) 
            return res.status(400).json({ errors: errors.array() });
		
		console.log("logging in..");	
		const users = db.collection('users');
		const b = req.body;

		const user = await users.findOne({name: b.name});
		if (!user) 
			return res.status(400).send(`No user named '${user.name}'.`);

		if (user.password != b.password) 
			return res.status(400).send(`Password incorrect.`);

		// Authenticated, generate token.
		res.cookie("session-tok", user.name, { maxAge: 360000, signed: true });

		return res.status(201).end();
	}
];

exports.logout = [
	exports.authenticator,
	async (req, res) => {
		console.log("logging out..");	

		res.clearCookie("session-tok");
		return res.status(201).end();
	}
];
