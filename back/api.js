const express = require("express");
const router = express.Router();

const core 				= require("./controller/core.js");
const userController 	= require("./controller/userController.js");
const profileController = require("./controller/profileController.js");
const threadController 	= require("./controller/threadController.js");

/*
const messageController = require("./controller/messageController.js");
const documentController = require("./controller/documentController.js");
const analysisController = require("./controller/analysisController.js");
*/

router.get('/test', (_, res) => res.json({"anna": "do you wanna build a snow man..?"}));
router.get('/secret', core.authenticator, (_, res) => res.json({"elsa": "go away anna!"}));

router.post('/register', userController.register);
router.post('/login', 	 userController.login);
router.post('/logout', 	 userController.logout);
router.get ('/self', userController.get);

router.get ('/profile/doctor', 	profileController.getDoctor);
router.get ('/profile/patient', profileController.getPatient);
router.post('/profile/edit', 	profileController.edit);


router.put ('/thread/put', 			 threadController.put); 		// Spawns a new thread with only the client
router.post('/thread/:threadId/add', threadController.addUser); 	// Adds user to a thread. The client must be in the thread in question
router.get ('/thread/:threadId/get', threadController.get); 		// Returns the thread's document. Only relevant information are the mails and
																	// members, the rest are ObjectID's and is illegible to the client. 
																	// (I might make it so it only returns the mails & members later)

/*
router.post('/documents/get', auth, documentController.get);
router.post('/documents/put', auth, documentController.post);

/*
router.post('/analysis', auth, analysisController.get);
*/

module.exports = router;
