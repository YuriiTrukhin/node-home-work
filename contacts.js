const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");
const contactsPath = path.join("./db/contacts.json");

async function listContacts() {
  try {
    const list = await fs.readFile(contactsPath, "utf-8");
    return JSON.parse(list);
  } catch (err) {
    console.log(err);
  }
}

async function getContactById(contactId) {
  const contactsData = await listContacts();
  const findContact = contactsData.find((contact) => contact.id === contactId);
  return findContact;
}

async function removeContact(contactId) {
  const contactsData = await listContacts();
  const filteredContacts = contactsData.filter((contact) => contact.id !== contactId);
  fs.writeFile(contactsPath, JSON.stringify(filteredContacts));
  return filteredContacts;
}

async function addContact(name, email, phone) {
  const newContact = {
    id: uuidv4(),
    name: name,
    email: email,
    phone: phone,
  };
  const contactsData = await listContacts();
  contactsData.push(newContact);
    fs.writeFile(contactsPath, JSON.stringify(contactsData));
    return contactsData;
}
module.exports = { listContacts, getContactById, removeContact, addContact };
