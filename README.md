# Papay Backend

Papay Backend is the server-side application for the **Papay food-delivery platform**. It provides the REST API consumed by the Papay React frontend, an EJS-based restaurant and administrator portal, MongoDB persistence, image uploads, member authentication, social features, order management, and real-time chat through Socket.IO.

## Features

- Member signup, login, logout, and profile management
- JWT authentication for the customer-facing REST API
- MongoDB-backed sessions for restaurant and administrator pages
- Restaurant discovery, rankings, profiles, likes, and view tracking
- Restaurant-owned menu and dish management
- Dish categories, sizes, volumes, inventory, discounts, and images
- Customer basket checkout and order lifecycle management
- Community articles with rich content and image uploads
- Member likes, follows, followers, and following lists
- Role-based restaurant and administrator access
- Real-time chat and online-user counts with Socket.IO
- EJS server-rendered management interface

## Tech Stack

- **Node.js** — JavaScript runtime
- **Express** — HTTP server and routing
- **MongoDB** and **Mongoose** — database and object modeling
- **JSON Web Tokens** — REST API authentication
- **Express Session** and **connect-mongodb-session** — portal sessions
- **bcryptjs** — password hashing
- **EJS** — restaurant/admin server-rendered pages
- **Multer** and **UUID** — image uploads with unique filenames
- **Socket.IO** — real-time communication
- **CORS** and **cookie-parser** — browser integration
- **Nodemon** — development server reloads

## Architecture

The application serves three interfaces from one Node.js process:

```text
Papay React client ───── REST API (`/`) ───────┐
                                               │
Restaurant/Admin browser ─ EJS portal (`/resto`) ─ Express
                                               │        │
Socket.IO client ─────── real-time events ─────┘        └── MongoDB
```

- The REST API uses a six-hour JWT stored in an `access_token` cookie.
- The restaurant/admin portal uses a 30-minute server session stored in MongoDB.
- Express and Socket.IO share the same HTTP server and port.
- Uploaded images are stored locally under `uploads/` and served from `/uploads`.

## Prerequisites

- [Node.js](https://nodejs.org/) 16 or newer
- npm
- A local MongoDB instance or MongoDB Atlas connection string

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dragonmm98/papay.git
cd papay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3007
MONGO_URL=mongodb://127.0.0.1:27017/papay
SESSION_SECRET=replace-with-a-long-random-session-secret
SECRET_TOKEN=replace-with-a-long-random-jwt-secret
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Express and Socket.IO port; defaults to `3007` |
| `MONGO_URL` | Yes | MongoDB URI used by Mongoose and the session store |
| `SESSION_SECRET` | Yes | Secret used to sign restaurant/admin sessions |
| `SECRET_TOKEN` | Yes | Secret used to sign and verify member JWTs |

Generate a strong secret with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Never commit `.env` or production credentials.

### 4. Create upload directories

Multer expects these directories to exist:

```text
uploads/
├── community/
├── members/
└── products/
```

### 5. Start the application

Development mode with automatic restarts:

```bash
npm run dev
```

Standard start:

```bash
npm start
```

By default:

- REST API and Socket.IO: [http://localhost:3007](http://localhost:3007)
- Restaurant/admin portal: [http://localhost:3007/resto](http://localhost:3007/resto)

The server starts only after it connects successfully to MongoDB.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm start` | Starts the application with Node.js |
| `npm run dev` | Starts the application with Nodemon |
| `npm run train` | Runs the standalone `train.js` exercise with Nodemon |
| `npm test` | Placeholder; automated tests are not configured yet |

## Authentication and Authorization

### Customer REST API

Successful signup or login sets an `access_token` JWT cookie that expires after six hours. The token contains the member ID, nickname, and role.

Browser clients must include credentials with API requests:

```js
const api = axios.create({
  baseURL: "http://localhost:3007",
  withCredentials: true,
});
```

Public read endpoints can attach the current member when a valid cookie is present. Protected write endpoints validate `req.member` before changing data.

### Restaurant and admin portal

The `/resto` portal uses Express sessions stored in the MongoDB `sessions` collection.

| Role | Capabilities |
| --- | --- |
| `RESTAURANT` | View, create, and update its own menu products |
| `ADMIN` | Review and update restaurant accounts |
| `USER` | Use customer-facing API features |
| `DELIVERY` | Supported by the member model for delivery workflows |

## REST API Reference

Most handlers return JSON in one of these forms:

```json
{
  "state": "succeed",
  "data": {}
}
```

```json
{
  "state": "fail",
  "message": "Error description"
}
```

Some restaurant handlers use `success` rather than `succeed`. Client code should inspect the returned `state` field.

### Members

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/signup` | Public | Register a customer and set the JWT cookie |
| `POST` | `/login` | Public | Authenticate a member and set the JWT cookie |
| `GET` | `/logout` | Public | Clear the authentication cookie |
| `GET` | `/check-me` | Required | Return the decoded authenticated member |
| `GET` | `/member/:id` | Optional | Get an active member profile |
| `POST` | `/member-liken` | Required | Toggle a like on a supported target |
| `POST` | `/member/update` | Required | Update the current member profile and image |

Signup example:

```json
{
  "mb_nick": "papay-user",
  "mb_phone": "+82-10-1234-5678",
  "mb_password": "strong-password"
}
```

Profile updates use `multipart/form-data` and support `mb_nick`, `mb_phone`, `mb_address`, `mb_description`, and an optional `mb_image` file.

Like request:

```json
{
  "like_ref_id": "target-object-id",
  "group_type": "product"
}
```

Supported like groups are `product`, `member`, and `community`.

### Restaurants

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/restaurants` | Optional | List active restaurants with pagination and sorting |
| `GET` | `/restaurants/:id` | Optional | Return an active restaurant profile |

Example:

```text
GET /restaurants?page=1&limit=10&order=mb_views
```

The `order` query supports normal descending sort fields and the special values `top` and `random`.

### Products and Menu Items

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/products` | Optional | Return paginated, sorted, active products |
| `GET` | `/products/:id` | Optional | Return one active product and track an authenticated view |

Product-list request:

```json
{
  "page": 1,
  "limit": 12,
  "order": "createdAt",
  "restaurant_mb_id": "optional-restaurant-object-id",
  "product_collection": "dish"
}
```

Only products with `PROCESS` status appear in the customer catalog.

Supported product values:

| Field | Values |
| --- | --- |
| Collection | `dish`, `salad`, `dessert`, `drink`, `etc` |
| Status | `PAUSED`, `PROCESS`, `DELETED` |
| Size | `small`, `normal`, `large`, `set` |
| Volume | `0.5`, `1`, `1.2`, `1.5`, `2` |

Size is required for dishes, salads, and desserts. Volume is required for drinks.

### Orders

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/orders/create` | Required | Create an order and its order items |
| `GET` | `/orders` | Required | List the current member's orders by status |
| `POST` | `/orders/edit` | Required | Change one of the current member's order statuses |

Create-order request:

```json
[
  {
    "_id": "product-object-id",
    "quantity": 2,
    "price": 15
  }
]
```

The server calculates the order total from the submitted quantity and price. Orders below `100` receive a delivery cost of `2`.

List orders:

```text
GET /orders?status=paused
```

Supported statuses are `PAUSED`, `PROCESS`, `FINISHED`, and `DELETED`.

Update an order:

```json
{
  "order_id": "order-object-id",
  "order_status": "PROCESS"
}
```

### Community

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/community/image` | Public | Upload an article image as `community_image` |
| `POST` | `/community/create` | Required | Create an article |
| `GET` | `/community/articles` | Optional | List articles written by a member |
| `GET` | `/community/target` | Optional | List paginated articles by board |
| `GET` | `/community/single-article/:art_id` | Optional | Return one article and track a view |

Supported boards are `celebrity`, `evaluation`, and `story`.

Example article request:

```json
{
  "art_subject": "A great dining experience",
  "art_content": "Article content",
  "art_image": "uploads/community/image.jpg",
  "bo_id": "evaluation"
}
```

List community content with:

```text
GET /community/target?bo_id=all&page=1&limit=10&order=createdAt
```

### Follows

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/follow/subscribe` | Required | Follow another member |
| `POST` | `/follow/unsubscribe` | Required | Unfollow another member |
| `GET` | `/follow/followings` | Public | List accounts followed by a member |
| `GET` | `/follow/followers` | Optional | List a member's followers |

Follow or unfollow request:

```json
{
  "mb_id": "target-member-object-id"
}
```

Pagination example:

```text
GET /follow/followers?mb_id=member-object-id&page=1&limit=10
```

## Restaurant and Admin Portal

All server-rendered routes use the `/resto` prefix.

| Method | Route | Role | Description |
| --- | --- | --- | --- |
| `GET` | `/resto` | Public | Portal homepage |
| `GET`, `POST` | `/resto/sign-up` | Public | Restaurant registration form and submission |
| `GET`, `POST` | `/resto/login` | Public | Restaurant/admin login form and submission |
| `GET` | `/resto/logout` | Signed in | Destroy the portal session |
| `GET` | `/resto/check-me` | Optional | Return the current session member |
| `GET` | `/resto/products/menu` | Restaurant session | Render the restaurant's menu manager |
| `POST` | `/resto/products/create` | `RESTAURANT` | Create a product with up to five images |
| `POST` | `/resto/products/edit/:id` | `RESTAURANT` | Update a product owned by the restaurant |
| `GET` | `/resto/all-restaurants` | `ADMIN` | Render restaurant administration |
| `POST` | `/resto/all-restaurants/update` | `ADMIN` | Update a restaurant account |

Restaurant signup uses `multipart/form-data` with the image field `restaurant_img`. Product creation accepts up to five files in `product_images`.

## Socket.IO Events

Socket.IO runs on the same host and port as the REST API.

| Direction | Event | Payload | Description |
| --- | --- | --- | --- |
| Server → client | `greetMsg` | `{ "text": "welcome" }` | Sent after connection |
| Server → clients | `infoMsg` | `{ "total": number }` | Broadcasts the online-user count |
| Client → server | `createMsg` | Message object | Sends a chat message |
| Server → clients | `newMsg` | Submitted message | Broadcasts the message to all clients |

Use a Socket.IO client compatible with the backend's `2.5.x` version.

## Data Model Overview

- **Member** — customer, restaurant, admin, or delivery identity and profile
- **Product** — dish/menu details, category, price, stock, size or volume, images, and restaurant owner
- **Order** — customer, total amount, delivery cost, and order status
- **OrderItem** — quantity, price, product, and parent order
- **BoArticle** — member-authored community content
- **Follow** — follower and followed-member relationship
- **Like** — likes for members, products, and community articles
- **View** — unique authenticated views of supported targets

Primary schemas use Mongoose timestamps for creation and update metadata.

## Project Structure

```text
papay/
├── controllers/              # Request handlers and authorization middleware
├── lib/                      # Enums, shared database helpers, and error messages
├── models/                   # Business logic and MongoDB operations
├── public/                   # Portal styles, scripts, and static images
├── schema/                   # Mongoose schemas
├── utils/                    # Multer upload configuration
├── views/                    # EJS restaurant/admin templates
├── app.js                    # Express, sessions, routes, and Socket.IO
├── server.js                 # Environment, MongoDB, and server startup
├── router.js                 # Customer REST API routes
├── router_bssr.js            # Restaurant/admin portal routes
├── train.js                  # Standalone JavaScript exercise
└── package.json
```

## Production Deployment

Install production dependencies and start the server:

```bash
npm ci --omit=dev
NODE_ENV=production npm start
```

For a durable deployment, run the process under a manager such as PM2 or systemd and place it behind an HTTPS reverse proxy.

Example PM2 command:

```bash
npm install --global pm2
pm2 start server.js --name papay-backend
pm2 save
```

Persist the `uploads/` directory across deployments and configure the frontend's `REACT_APP_API_URL` to the backend's public URL.

## Production Considerations

Before exposing the service publicly:

- Restrict CORS to trusted frontend origins.
- Set secure, HTTP-only, and appropriate same-site cookie options over HTTPS.
- Keep database credentials and secrets outside source control.
- Validate request bodies, identifiers, and enum values before database operations.
- Restrict upload MIME types and file sizes.
- Add rate limiting and security headers.
- Return consistent HTTP status codes and centralized error responses.
- Avoid trusting client-provided product prices when calculating orders.
- Disable authentication-token logging in production.
- Add unit, integration, and API tests.
- Back up MongoDB and uploaded files.

## Related Project

- [Papay React frontend](https://github.com/dragonmm98/papay-react)

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Make and test your changes.
4. Commit with a clear message: `git commit -m "feat: describe your change"`.
5. Push the branch and open a pull request against `master`.

## License

This project is licensed under the ISC License as declared in `package.json`.
