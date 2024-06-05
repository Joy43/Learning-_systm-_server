const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const nodemailer = require('nodemailer');
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
    const noteCollection = db.collection('note');
    const questionsCollection = db.collection('questions');
    const submitCollection = db.collection('submitquiz');
    const noticeCollection = db.collection('notice');
const resultCollection=db.collection('result');

    // ------------    live class      ------------

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

    app.put('/liveclass/:id', async (req, res) => {
      const id = req.params.id;
      const { description } = req.body;

      try {
        const result = await liveclassCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { description } }
        );

        if (result.modifiedCount === 1) {
          const updatedClass = await liveclassCollection.findOne({ _id: new ObjectId(id) });
          res.send(updatedClass);
        } else {
          res.status(404).send('Class not found');
        }
      } catch (error) {
        console.error("Error updating live class:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.delete('/liveclass/:id', async (req, res) => {
      const id = req.params.id;
    
      try {
        // Log the id being processed
        console.log(`Attempting to delete class with id: ${id}`);
    
        // Ensure the id is a valid ObjectId
        if (!ObjectId.isValid(id)) {
          console.error(`Invalid ObjectId: ${id}`);
          return res.status(400).send('Invalid ObjectId');
        }
    
        const result = await liveclassCollection.deleteOne({ _id: new ObjectId(id) });
    
        if (result.deletedCount === 1) {
          res.send({ message: 'Class deleted successfully' });
        } else {
          console.error(`Class with id ${id} not found`);
          res.status(404).send('Class not found');
        }
      } catch (error) {
        console.error(`Error deleting live class with id ${id}:`, error.stack); // Log the full error stack
        res.status(500).send('Internal Server Error');
      }
    });
    
    
    
    // ------------   note pdf    ------------

    app.post('/note', async (req, res) => {
      const classes = req.body;
      try {
        const result = await noteCollection.insertOne(classes);
        res.send(result);
      } catch (error) {
        console.error("Error adding live class:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get('/note', async (req, res) => {
      try {
        const result = await noteCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching live classes:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // ----------------------------    Notice --------------------------------       
    app.post('/notice',async(req,res)=>{
      const notices=req.body;
      try{
        const result=await noticeCollection.insertOne(notices);
        res.send(result)
      }catch(error){
        console.error('notice error ',error);
        res.status(500).send('notice not send');
      }
    })

    app.get('/notice',async(req,res)=>{
      try{
const result=await noticeCollection.find().toArray();
res.send(result)
      }catch(error){
console.error('api not work for ',error);
res.status(500).send('data fetching error');
      }
    })

    // -----------------------Result-------------------------
    app.post('/result',async(req,res)=>{
      const results=req.body;
      try{
const result=await resultCollection.insertOne(results);
res.send(result)
      }catch(error){
        console.error('ther error is',error);
        res.status(500).send('data fetching loading')

      }
    })

    app.get('/result',async(req,res)=>{
     try{
      const result=await resultCollection.find().toArray();
      res.send(result)
     } catch(error){
console.error('result fetching error',error);
res.status(500).send('result not showing error')
     }
    })

    // -----------------questions---------------

    app.post('/questions', async (req, res) => {
      const quiz = req.body;
      try {
        const result = await questionsCollection.insertOne(quiz);
        res.send(result);
      } catch (error) {
        console.error("Error adding quiz question:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get('/questions', async (req, res) => {
      try {
        const result = await questionsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // -------------quiz collection-----------

    app.post('/submitquiz', async (req, res) => {
      const userAnswers = req.body.answers;
      const userEmail = req.body.email;
      let correctCount = 0;
    
      try {
        const questions = await questionsCollection.find().toArray();
    
        const correctAnswers = questions.map((question) => {
          const isCorrect = userAnswers[question._id] === question.answer;
          if (isCorrect) {
            correctCount++;
          }
          return {
            questionId: question._id,
            answer: question.answer,
            isCorrect: isCorrect
          };
        });
    
        //--------------- Set up Nodemailer------------
        let transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
    
        let mailOptions = {
          from: process.env.EMAIL,
          to: userEmail,
          subject: 'Quiz Results',
          text: `You got ${correctCount} out of ${questions.length} correct!`,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.error("Error sending email:", error);
          }
          console.log('Email sent: ' + info.response);
        });
    
        res.send({ correctAnswers });
    
      } catch (error) {
        console.error("Error processing quiz results:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    

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
