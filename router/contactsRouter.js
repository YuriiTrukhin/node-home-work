const { Router } = require('express');
const logger = require("morgan");
const ContactsController = require("../controllers/contactsController.js")

const router = Router();
router.use(logger("dev"));

router.get("/", ContactsController.listContacts);
router.get("/:contactId", ContactsController.getContactById);
router.post("/", ContactsController.newContact);
router.delete("/:contactId", ContactsController.contactDelete);
router.patch("/:contactId", ContactsController.updateContact);

module.exports = router;