const contacts = require("./contacts.js");
const argv = require("yargs").argv;

function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case "list":
      contacts.listContacts().then((el) => console.table(el));
      break;

    case "get":
      contacts.getContactById(id).then((el) => console.table(el));
      break;

    case "add":
      contacts.addContact(name, email, phone).then((el) => console.table(el));
      break;

    case "remove":
      contacts.removeContact(id).then((el) => console.table(el));
      break;

    default:
      console.warn("\x1B[31m Unknown action type!");
  }
}

invokeAction(argv);
