const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');

// Store user IDs and their corresponding socket IDs
const userSockets = new Map();

dotenv.config();

//create express app
const app = express();
const server = createServer(app);
const io = new Server(server);

//middleware
app.use(bodyParser.json());

//Routes
const itemsRoutes = require('../routes/routes');
app.use('/api', itemsRoutes);

// token for authorization for one of the users that is already registered and logged in.
const authToken = process.env.AUTH_TOKEN;

// route for static pages
app.get('/index', (req, res) => {
    res.sendFile(join(__dirname, '..', '/public/index.html'));
});

app.get('/imageupload', (req, res) => {
    res.sendFile(join(__dirname, '..', '/public/imageUpload.html'));
});

io.on('connection', (socket) => {
    /* 
    When the io makes a connection, the user will be redirected to log in, after the user logs in then only the user will be able to place a bid on the platform.
    */

    console.log('a new user connected!');

    socket.on('place bid', async (bid) => {

        const itemid = bid.item_id;
        const bidamount = bid.bid_amount;
        var userid = 0;

        // send the axios post request to add bid to the database
        await axios.post(`http://localhost:3000/api/items/${itemid}/bids`, { bidamount: bidamount }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(async (response) => {
                const userId = await response.data.userid;
                userid = userId;

                if (!userSockets.has(userid)) {
                    userSockets.set(userid, socket.id);
                    console.log(`User ${userid} registered with socket ID ${socket.id}`);
                }
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
            });

        const newBid = { item_id: bid.item_id, user_id: userid, bid_amount: bid.bid_amount };
        io.emit('new bid', newBid);

        // Retrieve owner ID from the database
        await axios.get(`http://localhost:3000/api/items/${itemid}`)
            .then(async (response) => {
                const ownerId = await response.data.owner_id;
                console.log('Retrieved owner ID from the database:', ownerId);

                // add notification to the database
                const userid = ownerId;
                const message = `New bid placed on item id: ${bid.item_id} by user id: ${userid} of amount: ${bid.bid_amount}`;

                await axios.post(`http://localhost:3000/api/notifications`, { userid: userid, message: message }, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                })
                    .then(async (response) => {
                        const data = await response.data.message;
                        console.log(data);
                    })
                    .catch(error => {
                        console.log('Error adding notification to the database!', error);
                    });

                // Check if owner is connected
                console.log('getting owner connection status!');

                if (userSockets.has(ownerId)) {
                    // when a new bid is placed send a notification to the user
                    console.log('Owner is connected');
                    const ownerSocketId = userSockets.get(ownerId);
                    io.to(ownerSocketId).emit('notification', { message: 'New bid on your item', bid: bid });
                } else {
                    console.log('Owner is disconnected!')
                }
            })
            .catch(error => {
                console.error('Error retrieving owner ID:', error);
            });

    })

    socket.on('disconnect', () => {
        console.log('user disconnected!');
        // Remove the socket from the userSockets map
        userSockets.forEach((value, key) => {
            if (value === socket.id) {
                userSockets.delete(key);
            }
        });
    });
})

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});

module.exports = { app, server }; // Exporting app and server for testing
