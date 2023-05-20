const { body, query, validationResult } = require('express-validator');
const {ObjectId} = require("mongodb");

const db = require("../db.js").db("Medicare");
const auth = require("./core.js").authenticator;

const profiles = db.collection("profiles");
const users = db.collection("users");

exports.getDoctor = [
	query("name")
		.exists()
		.isString()
		.withMessage("Invalid Doctor name"),
	async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) 
            return res.status(400).json({errors: errors.array()});

		let query = { name: req.query.name };	
		const user = await users.findOne(query);
		if (!user || user.patient)
            return res.status(404).json({errors: "None such doctor"});

		query = { userId: user._id };
		const profile = await profiles.findOne(query);
		if (!profile) 
			throw Error("No profile found for user, shouldn't happen.");	

		return res.status(200).json(profile);
	}
];

exports.getPatient = [
	...auth,
	query("name")
		.exists()
		.isString()
		.withMessage("Invalid Patient name"),
	async (req, res) => {
	    const errors = validationResult(req);
        if (!errors.isEmpty()) 
            return res.status(400).json({errors: errors.array()});

		let query = { name: req.query.name };	
		const user = await users.findOne(query);

		if (!user || !user.patient)
            return res.status(404).json({errors: "None such patient"});

		query = { userId: user._id };
		const profile = await profiles.findOne(query);
		if (!profile) 
			throw Error("No profile found for user, shouldn't happen.");	

		return res.status(200).json(profile);
	}
];


exports.edit = [
	...auth,
	body("profile")
		.exists()
		.isObject()
		.withMessage("Invalid target profile"),
	body("profile._id")
		.exists()
		.isString()
		.withMessage("Invalid target profile Id"),
	async (req, res) => {
		const errors = validationResult(req);
        if (!errors.isEmpty()) 
            return res.status(400).json({errors: errors.array()});

		const b = req.body;
		const filter = { _id : new ObjectId(b.profile._id) };
		const profile = await profiles.findOne(filter);
		if (!profile)
            return res.status(404).json({errors: "None such profile"});

			
		const update = { $set: {} };
		const add_if = field => { if (b.profile[field]) update.$set[field] = b.profile[field]; };
		if (profile.patient) {
			add_if("providers"); 
			add_if("prescriptions"); 
			add_if("documents"); 
			add_if("analysis"); 
		} else {
			add_if("patients"); 
			add_if("employer"); 
		}
	
		const result = await profiles.updateOne(filter, update);
		console.log(result);

		return res.status(201).json({"result": "success"});
	}
];
