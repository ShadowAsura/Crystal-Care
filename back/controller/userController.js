const coll = require("../db.js").db("Medicare").collection("users");
const core = require("./core.js");
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
	body("patient")
		.exists()
		.isBoolean()
		.withMessage("Invalid patient parameter"),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) 
			return res.status(400).json({ errors: errors.array() });   

		console.log("registering..");	

		const b = req.body;
		const user = {
			name: 	b.name,
			age: 	b.age,
			password: 	b.password,
			patient: 	b.patient
		};

		// If user already exists
		if (await coll.findOne({name: user.name}) != null) 
			return res.status(400).send({errors: `User named '${user.name}' already exists.`});
		
		// Insert to db
		user._id = (await coll.insertOne(user)).insertedId;

		// Make profile
		user.profileId = core.makeProfileFor(user);
		
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
		const b = req.body;

		const user = await coll.findOne({name: b.name});
		if (!user) 
			return res.status(400).send({errors: `No user named '${user.name}'.`});

		if (user.password != b.password) 
			return res.status(400).send({errors: `Password incorrect.`});

		// Authenticated, generate token.
		res.cookie("session-tok", user.name, { maxAge: 360000, signed: true });

		return res.status(201).end();
	}
];

exports.logout = [
	core.authenticator,
	async (req, res) => {
		console.log("logging out..");	

		res.clearCookie("session-tok");
		return res.status(201).end();
	}
];
