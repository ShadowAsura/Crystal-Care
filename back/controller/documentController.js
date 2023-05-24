const { body, param, validationResult } = require('express-validator');
const { ObjectId } = require("mongodb");

const db = require("../db.js").db("Medicare");
const core = require("./core.js");

const documents = db.collection("documents");

exports.get = [
	core.authenticator,
	core.isSelfOrProvider,
	param("userId")
		.exists()
		.isString()
		.withMessage("No 'userId' parameter"),
	async (req, res) => {
		const userId = new ObjectId( req.params.userId );
		const filter = { userId };
		const docs = await documents.find(filter).toArray();
		console.log("documents: ", docs);
		return res.status(200).json(docs);
	}
];

exports.put = [
	core.authenticator,
	core.isProvider,
	param("userId")
		.exists()
		.isString()
		.withMessage("No 'userId' parameter"),
	body("doc")
		.exists()
		.isObject()
		.withMessage("No 'doc' object in body"),
	body("doc.title")
		.exists()
		.isString()
		.withMessage("No 'doc.title'"),
	body("doc.content")
		.exists()
		.isString()
		.withMessage("No 'doc.content'"),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) 
				return res.status(400).json({errors: errors.array()});

		const userId 	= new ObjectId( req.params.userId );
		const doc 		= req.body.doc;
		doc.userId 		= userId;
		const filter 	= { title: doc.title, userId };
		const options 	= { upsert: true };

		await documents.updateOne(filter, { $set: {...doc}  }, options);
		return res.status(200).end();
	}
];

/*
Tests:

# steph is provider for lebron
# Login as steph

await fetch("http://localhost:3030/api/documents/646d7f28d41ab0ed6d89e25e", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({doc: {
        title: "King James",
        content: "he has a glock in his 'rari"
    }})
}).then(res => res.json());

# GET
await fetch("http://localhost:3030/api/documents/646d7f28d41ab0ed6d89e25e", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
}).then(res => res.json());
 */
