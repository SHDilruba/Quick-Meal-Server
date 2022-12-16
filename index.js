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

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'unauthorized access'})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      return res.status(403).send({message: 'forbidden access'})
    }
      req.decoded = decoded;
      next();
  })
}

async function run(){
  try{
      const serviceCollection = client.db('quickMeal').collection('services');
      const benefitCollection = client.db('quickMeal').collection('benefits');
      const blogCollection = client.db('quickMeal').collection('blog');
      const reviewCollection = client.db('quickMeal').collection('reviews');

      app.post('/jwt', (req, res) =>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '7d'})
        res.send({token})
     })

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

     app.get('/benefits', async(req, res) =>{
      const query = {}
      const cursor = benefitCollection.find(query);
      const benefits = await cursor.toArray();
      res.send(benefits);
    });

     app.get('/blog', async(req, res) =>{
      const query = {}
      const cursor = blogCollection.find(query);
      const blog = await cursor.toArray();
      res.send(blog);
    });

    app.get('/myReviews', verifyJWT, async(req, res) =>{
      const decoded = req.decoded;

       if(decoded.email !== req.query.email){
        res.status(403).send({message: 'unauthorized access'})
       }

      let query = {};
      if(req.query.email){
          query = {
             email: req.query.email
          }
      }
      const cursor = reviewCollection.find(query).sort({_id: -1});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.get('/reviews', async(req, res) =>{
      const query = {}
      const cursor = reviewCollection.find(query).sort({_id: -1});
      const reviews = await cursor.toArray();
      res.send(reviews);
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