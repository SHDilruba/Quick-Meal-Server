const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9bzbqn1.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
      const serviceCollection = client.db('quickMeal').collection('services');
      const benefitCollection = client.db('quickMeal').collection('benefits');

        app.get('/services', async(req, res) =>{
          const query = {}
          const cursor = serviceCollection.find(query).sort({service_id: 1});
          const services = await cursor.toArray();
          res.send(services);
      });

      app.get('/topServices', async(req, res) =>{
        const query = {}
        const cursor = serviceCollection.find(query).sort({service_id: 1}).limit(3);
        const services = await cursor.toArray();
        res.send(services);
      });

      app.get('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const service = await serviceCollection.findOne(query);
        res.send(service);
      });

      app.post('/topServices', async(req, res) =>{
        const service = req.body;
        const result = await serviceCollection.insertOne(service);
        console.log(result);
        service._id = service.insertedId;
        res.send(service);
     });

  }
  finally{
  }
}

run().catch(err => console.error(err))

app.get('/', (req, res) =>{
  res.send('server is running')
})

app.listen(port, () =>{
  console.log(`server is running on ${port}`)
})