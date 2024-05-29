const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000"]
}));
app.use(express.json());

// MongoDB Connection URI
const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    const db = client.db('DbLearn');
    const liveclassCollection = db.collection('liveclass');
    const questionsCollection = db.collection('questions');

    app.post('/liveclass', async (req, res) => {
      const classes = req.body;
      try {
        const result = await liveclassCollection.insertOne(classes);
        res.send(result);
      } catch (error) {
        console.error("Error adding live class:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get('/liveclass', async (req, res) => {
      try {
        const result = await liveclassCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching live classes:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    // ----------quiz post-------

    app.post('/questions', async (req, res) => {
     const quiz=req.body;
      try {
        const result = await  questionsCollection.insertOne(quiz);
        res.send(result);
      } catch (error) {
        console.error("Error adding live class:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    // ---------quiz get--------------
    app.get('/questions', async (req, res) => {
      try {
        const result = await questionsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching live classes:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // ------port------

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running');
});
