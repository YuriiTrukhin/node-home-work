const { Router } = require('express');
const logger = require("morgan");
const ContactsController = require("../controllers/contactsController.js")

const router = Router();
router.use(logger("dev"));

router.get("/", ContactsController.listContacts);
router.get("/:contactId", ContactsController.validateId,ContactsController.getContactById);
router.post("/", ContactsController.newContact);
router.delete("/:contactId",ContactsController.validateId, ContactsController.contactDelete);
router.patch("/:contactId",ContactsController.validateId, ContactsController.updateContact);

module.exports = router;