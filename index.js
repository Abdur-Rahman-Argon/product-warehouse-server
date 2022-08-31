const express = require("express");
var cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const app = express();
const port = process.env.PORT || 5000;
const tokenSecret = process.env.JWT_SECRET_KEY;

app.use(cors());
app.use(express.json());

// verify jwt token
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, tokenSecret, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden" });
    } else {
      req.decoded = decoded;
      next();
    }
  });
};

//  MongoDB uri
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.rtskruf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// mongoBd route set Function
async function run() {
  try {
    await client.connect;

    const collection = client.db("test").collection("devices");

    const itemsCollection = client.db("services").collection("AllItems");

    //
    app.get("/AllItems", async (req, res) => {
      const query = {};
      const cursor = await itemsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //single data load
    app.get("/AllItems/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await itemsCollection.findOne(query);
      res.send(result);
    });

    // one items data update api
    app.put("/stockUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const stock = req.body;
      const filter = { _id: ObjectID(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { stock: stock.stock, quantity: stock.quantity },
      };
      const result = await itemsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(` server is connect on = ${port}`);
});
