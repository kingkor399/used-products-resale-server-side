const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rdadvit.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbiden access' })
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {
        const resaleproductCollection = client.db('resalebd').collection('productresale');
        const resaleproductCategoryCollection = client.db('resalebd').collection('productCategory');
        const usersCollection = client.db('resalebd').collection('users');
        const bookingsCollection = client.db('resalebd').collection('bookings');
        const productsCollection = client.db('resalebd').collection('products');
        app.get('/products', async (req, res) => {
            const query = {};
            const result = await resaleproductCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id: id };
            const result = await resaleproductCategoryCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const user = await usersCollection.find(query).toArray();
            res.send(user);
        })
        app.get('/users/admin/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
        })

        app.get('/users/seller/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            res.send({isSeller: user?.select === 'seller'});
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '12h' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            const query = { email: email };
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const booking = await bookingsCollection.find(query).toArray();
            res.send(booking);
        })

        app.post('/bookings', async (req, res) => {
            const bookings = req.body
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result);
        })

        app.get('/myproducts', async(req, res)=>{
            const query = {};
            const myproduct = await productsCollection.find(query).toArray();
            res.send(myproduct);
        })

        app.post('/products', async(req, res)=>{
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })

        app.delete('/myproduct/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })
    }

    finally {

    }
}
run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('resale bd is running')
})

app.listen(port, () => {
    console.log(`resale server api is running on: ${port}`)
})