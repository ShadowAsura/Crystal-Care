const express = require("express");
const router = express.Router();

const userController = require("./controller/userController.js");
/*
const profileController = require("./controller/profileController.js");
const messageController = require("./controller/messageController.js");
const documentController = require("./controller/documentController.js");
const analysisController = require("./controller/analysisController.js");
*/

router.get('/test', (_, res) => res.json({"anna": "do you wanna build a snow man..?"}));
router.post('/secret', userController.authenticator, (_, res) => res.json({"elsa": "go away anna!"}));

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

/*
router.post('/profile/doctor/:id', profileController.getDoctor);
router.post('/profile/patient/:id', auth, profileController.getPatient);
router.post('/profile/edit/:id', 	auth, profileController.post);

router.post('/message/get', auth, messageController.get);
router.post('/message/put', auth, messageController.put);
router.post('/documents/get', auth, documentController.get);
router.post('/documents/put', auth, documentController.post);

router.post('/analysis', auth, analysisController.get);
*/

module.exports = router;
