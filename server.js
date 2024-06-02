const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const itemsController = require('./controllers/itemsController');
// Store user IDs and their corresponding socket IDs
const userSockets = new Map(); 
const path = require('path');

dotenv.config();

//create express app
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

//middleware
app.use(bodyParser.json());

//Routes
const itemsRoutes = require('./routes/routes');
app.use('/api', itemsRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

app.get('/api', (req, res) => {
    res.sendFile(join(__dirname, 'imageUpload.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected!');

    // Assuming user ID is sent after connection for identification
    socket.on('register', (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });

    socket.on('place bid', (bid) => {
        console.log('New bid placed: ', bid);
        io.emit('new bid', bid);

        // Retrieve owner ID from the database
        itemsController.getItemOwner(bid.item_id)
        .then(ownerId => {
            console.log('Retrieved owner ID from the database:', ownerId);

            // Check if owner is connected
            if (userSockets.has(ownerId)) {
                // when a new bid is placed send a notification to the user
                console.log('getting owner connection status!');
                const ownerSocketId = userSockets.get(ownerId);
                io.to(ownerSocketId).emit('notification', { message: 'New bid on your item', bid: bid });
                console.log(ownerSocketId);
            }
        })
        .catch(error => {
            console.error('Error retrieving owner ID:', error);
        });
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log('message: ' + msg);
    });

    socket.on('disconnect', ()=> {
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
