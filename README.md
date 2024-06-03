
# Auction Platform

This project is a comprehensive Auction Platform built with Node.js, Express, and MySQL. It allows users to register, log in, create items for auction, place bids, receive real time notifications, and more.

  

## Table of Contents

  

- [Features](#features)

- [Installation](#installation)

- [Usage](#usage)

- [API Endpoints](#api-endpoints)

- [Testing](#testing)

- [Technologies Used](#technologies-used)

- [Contributing](#contributing)

- [License](#license)

- [Contact](#contact)

  

## Features

  

- User registration and authentication

- Role-based access control

- Create, update, delete, and view auction items

- Place bids on items

- Real-time notifications for bids

- Image upload for item profiles

- Pagination and search for items

  

## Installation

  

To get this project up and running on your local machine, follow these steps:

  

1.  **Clone the repository**:

```bash

git clone https://github.com/Aniket-1608/auction-platform.git

cd auction-platform

```

  

2.  **Install dependencies**:

```bash

npm install

```

  

3.  **Create a `.env` file** in the root directory and add the following environment variables:

```

DB_HOST=your_database_host

DB_USER=your_database_user

DB_PASSWORD=your_database_password

DB_NAME=your_database_name

PORT=3000

JWT_SECRET_KEY=your_jwt_secret_key

AUTH_TOKEN =your_test_auth_token(will be sent with the response after the user is registered and logged in)

```

  

4.  **Set up the database**:

- Make sure you have a MySQL server running.

- Create a database with the name specified in your `.env` file.

- Run the SQL scripts or migrations to set up the necessary tables.

  

5.  **Start the server**:

```bash

npm start

```

  

6.  **Access the application**:

Open your browser and navigate to `http://localhost:3000`.

  

## Usage

  

### Running the Server

  

To start the server, use:

```bash

npm  start

```

  

## API Endpoints

Here is a list of the main API endpoints available in this project:

  

### User Endpoints

  

`POST /api/users/register`: Register a new user

`POST /api/users/login`: Login a user

`GET /api/users/profile`: Get the profile of the logged-in user

  

### Item Endpoints

  

`GET /api/items/`: Get all items

`GET /api/items/:id:` Get an item by ID

`POST /api/items/`: Create a new item

`PUT /api/items/:id`: Update an item by ID

`DELETE /api/items/:id`: Delete an item by ID

`POST /api/items/search`: Search items

`POST /api/items/pages`: Get items with pagination

  

### Bid Endpoints

  

`GET /api/items/:itemid/bids`: Get all bids for an item

`POST /api/items/:itemid/bids`: Place a bid on an item

  

### Notification Endpoints

  

`GET /api/notifications`: Get notifications for the logged-in user

`POST /api/notifications/mark-read`: Mark notifications as read

### Image Upload Endpoint

  

`POST /uploads`: Upload an image file

  

## Testing

To run the tests, use the following command:

  

```bash

npm test

```

## Technologies Used

`Node.js`

`Express`

`MySQL2`

`Socket.io`

`Bcrypt`

`JSON Web Token`

`Dotenv`

`Jest (for testing)`

`Supertest (for API testing)`

`Multer (for file uploads)`

  

## Contributing

We welcome contributions to this project. If you would like to contribute, please fork the repository and submit a pull request.


1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see `LICENSE.txt` file for more details.

  

## Contact

For any questions or feedback, please contact-  aniketjanabandhu2002@gmail.com.