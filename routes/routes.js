const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');
const userController = require('../controllers/userController');
const bidsController = require('../controllers/bidsController');
const notificationController = require('../controllers/notificationsController');
const authenticateUser = require('../middleware/authenticateUser');
const multer = require('multer');

const checkRole = authenticateUser.checkRole;

// routes for items
router.get('/items/', itemsController.getAllItems);
router.get('/items/:id', itemsController.getItemById);
router.post('/items/', (checkRole('admin') || checkRole('user')), itemsController.createItem);
router.put('/items/:id', (checkRole('admin') || checkRole('user')), itemsController.updateItem);
router.delete('/items/:id', (checkRole('admin') || checkRole('user')), itemsController.deleteItem);

//routes for users
router.post('/users/register/', userController.registerUser);
router.post('/users/login/', userController.loginUser);
router.get('/users/profile/', (checkRole('admin') || checkRole('user')), userController.getProfile);

// routes for bids
router.get('/items/:itemid/bids/', bidsController.getItemBids);
router.post('/items/:itemid/bids/', (checkRole('admin') || checkRole('user')), bidsController.placeItemBids);

//route for notifications
router.get('/notifications', (checkRole('admin') || checkRole('user')), notificationController.getNotifications);
router.post('/notifications/mark-read', notificationController.markNotifications);

//route for search and filteration
router.post('/items/search', itemsController.searchItem);

//route for items pagination
router.post('/items/pages', itemsController.getAllItemsPagination);

//route to find the owner of the item.
router.get('/items/owner', itemsController.getItemOwner);


//route for image uploads
const upload = multer({ dest: './uploads/' })
router.post('/uploads', upload.single('uploaded_file'), (req, res) => {
    // Check if req.file contains the file
    if (!req.file) {
        return res.status(403).json({ message: 'File not uploaded! Please attach only jpeg/png file under 5 MB.' });
    }
    console.log(req.file, req.body);
    res.status(201).json({ message: 'File uploaded successfully.', file: req.file });
});

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
});

module.exports = router;