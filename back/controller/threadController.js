const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');

const threads 	= require("../db.js").db("Medicare").collection("threads");
const users   	= require("../db.js").db("Medicare").collection("users");
const core 		= require("./core.js");

exports.addToUser = async (userId, threadId) => {
	const filter = { _id: new ObjectId(userId) };
	const update = { 
		$push: {
			threads: new ObjectId(threadId)
		}
	};
	await users.updateOne(filter, update);
}

exports.put = [
	...core.authenticator,
	body("threadName")
		.exists()
		.isString()
		.withMessage("No thread name provided"),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) 
			return res.status(400).json({ errors: errors.array() });

		// Create thread
		const b = req.body;
		console.log(b.user)
		const thread = {
			users: [new ObjectId(b.user.id)],
			name: b.threadName,
			messages: [],
		};
		const id = (await threads.insertOne(thread)).insertedId;

		// Add thread to user
		exports.addToUser(b.user.id, id);

		return res.status(201).json({_id: id});
	}
];

exports.addUser = [
	...core.authenticator,
	...core.inThread,
	body("newUserName")
		.exists()
		.isString()
		.withMessage("Invalid newUserName"),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) 
			return res.status(400).json({ errors: errors.array() });
		const b = req.body;
		const threadId = req.params.threadId;

		// Find user with name
		let query = { name: b.newUserName };
		const newUser = await users.findOne(query);
		if (!newUser) 
			return res.status(404).json({ error: `None such user '${b.newUserName}'` });
		console.log(newUser);
		
		// Check if already in thread
		if (newUser.threads && newUser.threads.filter(id => id.toString() == threadId).length != 0)  
			return res.status(400).send(`Already in thread`);

		// Update 
		const filter = { _id: new ObjectId(threadId) };
		const update = { 
			$push: {
				users: new ObjectId(newUser._id)
			}
		};
		await threads.updateOne(filter, update);

		// Add thread to user
		exports.addToUser(newUser._id.toString(), threadId);

		return res.status(201).end();
	}
];

exports.get = [
	...core.authenticator,
	...core.inThread,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) 
			return res.status(400).json({ errors: errors.array() });

		const filter = { _id: new ObjectId(req.params.threadId) };
		const thread = await threads.findOne(filter); 

		return res.status(200).json(thread);
	}
];


/*
Register Curry
Register & Login As lebron

# Make thread
fetch("http://localhost:3030/api/thread/put", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
		user: {
        	name: "le bron james",
			id: ID
		},
        threadName: "How will my legacy be affected?",
    })
}).then(res => res.json()).then(console.log);

# Add Member:
fetch(`http://localhost:3030/api/thread/${TID}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
		user: {
        	name: "le bron james",
			id: ID
		},
        newUserName: "steph curry",
    })
}).then(res => res.json()).then(console.log);

# Get:
fetch(`http://localhost:3030/api/thread/${TID}/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
		user: {
        	name: "le bron james",
			id: ID
		}
    })
}).then(res => res.json()).then(console.log);
 */
