const mongoose = require("mongoose");

const { Schema } = mongoose;

const ContactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: (value) => value.includes("@"),
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);
// создастся как contacts
const Contact = mongoose.model("Contact", ContactSchema);

module.exports = Contact;
