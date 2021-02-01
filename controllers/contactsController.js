const contacts = require("../db/contacts.json");
const fs = require("fs").promises;
const path = require("path");
const contactsPath = path.join("./db/contacts.json");

class ContactsController {
  notfound=(id,res)=>{
    const foundContact = contacts.find((contact) => contact.id === id);
    if (!foundContact) {
      return res.status(404).send({ message: "Not found" });
    }
  }
  listContacts(req, res) {
    res.json(contacts);
  }
  getContactById=(req, res)=> {
    const { contactId } = req.params;
    const id = Number(contactId);
    this.notfound(id,res)
    const foundContact = contacts.find((contact) => contact.id === id);
    res.status(200).send(foundContact)
  }
  newContact(req, res) {
    const newContact = {
      id: contacts.length + 1,
      ...req.body,
    };
    if(!req.body.name||!req.body.email||!req.body.phone){
      return res.status(400).send({ message: `missing required name field` })
    }
    contacts.push(newContact);
    fs.writeFile(contactsPath, JSON.stringify(contacts));
    res.status(201).send(newContact);
  }
  contactDelete=(req, res) =>{
    const { contactId } = req.params;
    const id = Number(contactId);
    this.notfound(id,res)
    const newContacts = contacts.filter((contact) => contact.id !== id);
    fs.writeFile(contactsPath, JSON.stringify(newContacts));
    res.status(200).send({ message: "contact deleted" });
  }
  updateContact=(req, res)=> {
    const { contactId } = req.params;
    const id = Number(contactId);
    this.notfound(id,res)
    const contactIndex = contacts.findIndex((contact) => contact.id === id);
  const updatedContact = {
    ...contacts[contactIndex],
    ...req.body,
  };
  if(req.body.name||req.body.email||req.body.phone){
    contacts[contactIndex] = updatedContact;
    fs.writeFile(contactsPath, JSON.stringify(contacts));
    return res.status(200).send(contacts[contactIndex]);
  }
  return res.status(400).send({ message: `missing required name field` })
  }
}
module.exports = new ContactsController();