import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// const url = "mongodb://localhost";

const app = express();

const PORT = process.env.PORT;

const url = process.env.url;

app.use(cors());

app.use(express.json());

//get products

app.get("/products", async function (req, res) {
  try {
    let client = await MongoClient.connect(url);
    let db = client.db("equipment_hiring");
    let data = await db.collection("products").find().toArray();
    client.close();
    res.json(data);
  } catch (error) {
    console.error();
    res.status(500).json({
      message: "something went wrong",
    });
  }
});

//create products

app.post("/createProducts", async function (req, res) {
  let client = await MongoClient.connect(url);
  let db = client.db("equipment_hiring");
  const data = req.body;
  let val = await db.collection("products").insertMany(data);
  await client.close();
  res.json(val);
});

//create register

app.post("/register", async function (req, res) {
  try {
    let client = await MongoClient.connect(url);
    let db = client.db("equipment_hiring");
    let salt = bcryptjs.genSaltSync(10);
    let hash = bcryptjs.hashSync(req.body.password, salt);
    req.body.password = hash;
    let data = await db.collection("users").insertOne(req.body);
    await client.close();
    res.json({
      message: "user registered",
    });
  } catch (error) {
    console.error();
    res.status(500).json({
      message: "something went wrong",
    });
  }
});

//create signin

app.post("/signin", async function (req, res) {
  try {
    let client = await MongoClient.connect(url);
    let db = client.db("equipment_hiring");
    let user = await db
      .collection("users")
      .findOne({ username: req.body.username });
    if (user) {
      let matchPassword = bcryptjs.compareSync(
        req.body.password,
        user.password
      );
      if (matchPassword) {
        res.json({
          userData: user,
          message: ("Logged in as", user.username),
        });
      } else {
        return res.json({
          message: "Password Incorrect",
        });
      }
    } else {
      return res.status(404).json({
        message: "User Not found ! Please register",
      });
    }
    await client.close();
  } catch (error) {
    console.error();
    return res.status(500).json({
      message: "something went wrong",
    });
  }
});

app.listen(PORT || 5000, function () {
  console.log("Server started in 5000");
});
