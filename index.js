const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rdadvit.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const resaleproductCollection = client.db('resalebd').collection('productresale');
        const resaleproductCategoryCollection = client.db('resalebd').collection('productCategory');
        app.get('/products', async(req, res) =>{
            const query = {};
            const result = await resaleproductCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/category/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {id:id};
            const result = await resaleproductCategoryCollection.find(query).toArray();
            res.send(result);
        })
    }

    finally{

    }
}
run().catch(err => console.log(err))

app.get('/', (req, res) =>{
    res.send('resale bd is running')
})

app.listen(port, () =>{
    console.log(`resale server api is running on: ${port}`)
})