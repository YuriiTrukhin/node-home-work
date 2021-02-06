const Joi = require("joi");
const {
  Types: { ObjectId },
} = require("mongoose");

const Contact = require("../models/Contact.js");

class ContactsController {
  validateUser(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required(),
      phone: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required(),
    });
    const result = validationRules.validate(req.body);
    if (result.error) {
      return res.status(400).send(result.error);
    }

    next();
  }
  validateUserUpdate(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string().alphanum().min(3).max(30),
      email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
      phone: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/),
    }).min(1);
    const result = validationRules.validate(req.body);
    if (result.error) {
      return res.status(400).send(result.error);
    }

    next();
  }
  validateId(req, res, next) {
    const {
      params: { contactId },
    } = req;
    if (!ObjectId.isValid(contactId)) {
      return res.status(400).send("Your id is not valid");
    }
    next();
  }
  async listContacts(req, res) {
    const contacts = await Contact.find();
    res.json(contacts);
  }
  async getContactById(req, res) {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(400).send("User isn't found");
    }
    res.json(contact);
  }
  async newContact(req, res) {
    try {
      const { body } = req;
      const newContact = await Contact.create(body);
      res.json(newContact);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
  async contactDelete(req, res) {
    const {
      params: { contactId },
    } = req;
    const deletedContact = await Contact.findByIdAndDelete(contactId);
    if (!deletedContact) {
      return res.status(400).send("User isn't found");
    }
    res.json(deletedContact);
  }
  async updateContact(req, res) {
    const {
      params: { contactId },
    } = req;
    const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (!updatedContact) {
      return res.status(400).send("User isn't found");
    }
    res.json(updatedContact);
  }
}
module.exports = new ContactsController();
