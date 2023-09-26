require("dotenv").config();
import type { Request, Response } from "express";
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.send("hiii :)");
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000/");
});
