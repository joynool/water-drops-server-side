const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//water-drops
//l2mOpB6Ocf5sMxFJ
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iganj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run ()
{
    try {
        await client.connect();
        const database = client.db('water-drops');
        const productsCollect = database.collection('products');
        const usersCollect = database.collection('users');
        const reviewsCollect = database.collection('reviews');
        const ordersCollect = database.collection('orders');

        app.get('/products', async (req, res) =>
        {
            const cursor = productsCollect.find({});
            const size = parseInt(req.query.size);
            let products;
            if (size) {
                products = await cursor.limit(size).toArray();
            } else {
                products = await cursor.toArray();
            }
            res.json(products);
        });

        app.get('/products/:id', async (req, res) =>
        {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollect.findOne(query);
            res.json(result);
        });

        app.post('/reviews', async (req, res) =>
        {
            const reviews = req.body;
            const result = await reviewsCollect.insertOne(reviews);
            res.json(result);
        });

        app.get('/reviews', async (req, res) =>
        {
            const cursor = reviewsCollect.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        app.post('/orders', async (req, res) =>
        {
            const newOrder = req.body;
            const result = await ordersCollect.insertOne(newOrder);
            res.json(result);
        });

        app.delete('/orders/:id', async (req, res) =>
        {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollect.deleteOne(query);
            res.json(result);
        });

        app.get('/orders/:email', async (req, res) =>
        {
            const email = req.params.email;
            const query = { email: { $eq: email } };
            const cursor = ordersCollect.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/users', async (req, res) =>
        {
            const user = req.body;
            const result = await usersCollect.insertOne(user);
            res.json(result);
        });
    }
    finally {
        //await client.close();
    }
};

run().catch(console.dir);

app.get('/', (req, res) =>
{
    res.send('Water Drops Server')
});

app.listen(port, () =>
{
    console.log('Server running at port', port)
});