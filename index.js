const express = require("express");
const cors = require("cors");
const routerContacts = require("./router/contactsRouter");
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.port || 3000;

class Server {
  start() {
    this.server = express();
    this.initMiddlewares();
    this.initRoutes();
    this.connectToDb();
    this.listen();
  }
  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(
      cors({
        origin: "*",
      })
    );
  }
  initRoutes() {
    this.server.use("/api/contacts", routerContacts);
  }
  async connectToDb () {
    try {
      await mongoose.connect(process.env.URL,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log("Database connection successful");
} catch(error){
  process.exit(1)
  }
  }
  listen() {
    this.server.listen(PORT, () => {
      console.log("Server is listening on port: ", PORT);
    });
  }
}
const server = new Server();
server.start();