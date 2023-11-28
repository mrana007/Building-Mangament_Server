const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4kezvwg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const apartmentCollection = client.db("buildingDb").collection("apartments");
    const agreementCollection = client.db("buildingDb").collection("agreements");
    const userCollection = client.db("buildingDb").collection("users");
    const announcementCollection = client.db("buildingDb").collection("announcements");
    const couponCollection = client.db("buildingDb").collection("coupons");

    // users related api
    // user update role user to member
    app.patch('/users/role/:email', async (req, res) => {
        const email = req.params.email;
        const filter = { email: email }
        const updateDoc = {
            $set: {
                role: 'member'
            }
        }
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
    });

    // get users
    app.get("/users", async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
      });
    //   post users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // make user as admin
   // verify admin
   app.get('/users/admin/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
        let admin = false;
        if (user) {
            admin = user?.role === 'admin';
        }
        res.send({ admin });
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // apartments related api
    app.get("/apartments", async (req, res) => {
      const result = await apartmentCollection.find().toArray();
      res.send(result);
    });

    // agreements related api
    // user status pending to checked
    app.patch('/agreement/status/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {
            $set: {
                status: 'checked'
            }
        }
        const result = await agreementCollection.updateOne(filter, updateDoc);
        res.send(result);
    });
    // get agreements data
    app.get("/agreements", async (req, res) => {
      const result = await agreementCollection.find().toArray();
      res.send(result);
    });
    // post agreements data
    app.post("/agreements", async (req, res) => {
      const agreementData = req.body;
      const result = await agreementCollection.insertOne(agreementData);
      res.send(result);
    });
    
    // announcement related api
    app.get("/announcements", async (req, res) => {
        const result = await announcementCollection.find().toArray();
        res.send(result);
      });

    app.post("/announcements", async (req, res) => {
        const announcementData = req.body;
        const result = await announcementCollection.insertOne(announcementData);
        res.send(result); 
      });
    //   coupons related api
    app.get("/coupons", async (req, res) => {
        const result = await couponCollection.find().toArray();
        res.send(result);
      });

    app.post("/coupons", async (req, res) => {
        const couponData = req.body;
        const result = await couponCollection.insertOne(couponData);
        res.send(result);
      });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("building management is running");
});

app.listen(port, () => {
  console.log(`building management is running on port: ${port}`);
});
