# 🚀 Application Workflow (Step-by-Step)

---

## 🔐 1. User Registration and Login

### Step 1: User Visits the Login or Registration Page  
**Frontend:**  
The user opens the app and sees options to log in or register (sign up).  
**Pages:**  
`login.jsx` (Login)  
`register.jsx` (Register)

### Step 2: User Fills the Form and Submits  
The user enters their details (like email and password) and clicks the submit button.

### Step 3: API Call to Backend  
The frontend sends the user’s details to the backend using an API:  
- Register: `POST /api/auth/register`  
- Login: `POST /api/auth/login`  
This is done using Redux “thunks” (special functions that handle API calls and state updates).

### Step 4: Backend Processes the Request  
**Backend:**  
Receives the request in `auth-routes.js`.  
Handles the logic in `auth-controller.js`.  
- For registration, it creates a new user in the database.  
- For login, it checks if the user exists and if the password is correct.

### Step 5: Response and Navigation  
If successful:  
- The backend sends back a success message and user info (and maybe a token).  
- The frontend saves this info (in Redux state and/or local storage).  
- The user is redirected to the home page or dashboard.  

If failed:  
- An error message is shown (like “Invalid password”).

---

## 🖼️ 2. Feature Image Management (Admin Only)

### Step 1: Admin Logs In and Goes to Dashboard  
**Frontend:**  
Admin logs in as above.  
Navigates to the dashboard page: `dashboard.jsx`.

### Step 2: Dashboard Loads Existing Feature Images  
When the dashboard loads, it automatically calls the API:  
- `GET /api/common/feature/get`  
This fetches all current feature images from the backend.

### Step 3: Admin Uploads a New Feature Image  
Admin clicks “Upload Image” and selects a file.  
The image is uploaded (possibly to a cloud service like Cloudinary).  
After upload, the image URL is sent to the backend:  
- `POST /api/common/feature/add` with `{ image: imageUrl }`

### Step 4: Backend Saves the Image  
**Backend:**  
Receives the request in `feature-routes.js`.  
Logic in `feature-controller.js`.  
Saves the image URL in the database.

### Step 5: Dashboard Updates  
The frontend fetches the updated list of images.  
The new image appears in the dashboard.

### Step 6: Admin Deletes a Feature Image  
Admin clicks “Delete” on an image.  
The frontend calls:  
- `DELETE /api/common/feature/delete/:imageId`  
Backend deletes the image from the database.  
The dashboard refreshes to show the updated list.

---

## 🛍️ 3. Product Browsing (User Side)

### Step 1: User Visits the Shop Page  
**Frontend:**  
User navigates to the shop or home page (e.g., `client/src/pages/shop/shop.jsx`).

### Step 2: Shop Page Loads Products  
The frontend calls:  
- `GET /api/shop/products`  
This fetches the list of available products from the backend.

### Step 3: Backend Responds with Product Data  
**Backend:**  
Receives the request in `server/routes/shop/shop-routes.js`.  
Logic in `server/controllers/shop/shop-controller.js`.  
Fetches products from the database and sends them back.

### Step 4: Products Displayed to User  
The frontend displays the products in a grid or list.  
User can click on a product to see more details.

---

## 🛒 4. Order Placement (User Side)

### Step 1: User Adds Products to Cart  
**Frontend:**  
On the shop page, the user clicks “Add to Cart” for products.  
The cart is managed in Redux state (`client/src/store/cart-slice/index.js`).  
The cart icon or page updates to show selected items.

### Step 2: User Proceeds to Checkout  
The user clicks “Checkout.”  
Navigates to the checkout page (`client/src/pages/shop/checkout.jsx`).

### Step 3: User Uploads Prescription (if required)  
Some medicines require a prescription.  
The user is prompted to upload a prescription file (image or PDF).  
The file is uploaded to the backend:  
- `POST /upload` (handled by Multer in `server.js`)  
The backend saves the file in `/uploads/` and returns the file URL.

### Step 4: User Places the Order  
The user confirms the order.  
The frontend sends the order details (cart items, prescription URL, user info) to the backend:  
- `POST /api/shop/order/add`

### Step 5: Backend Saves the Order  
**Backend:**  
Receives the order in `order-routes.js`.  
Logic in `order-controller.js`.  
Saves the order in the database, including prescription file URL if present.

### Step 6: Real-Time Notification to Admin  
The backend emits a Socket.io event (`neworder`) to all connected admin clients.  
Admin dashboard receives this event and updates the order list instantly.

---

## 📋 6. Order Management (Admin Side)

### Step 1: Admin Opens the Dashboard  
**Frontend:**  
Admin logs in and goes to the dashboard (`dashboard.jsx`).

### Step 2: Dashboard Loads Orders  
The dashboard calls:  
- `GET /api/admin/orders`  
The backend responds with all current orders.

### Step 3: Admin Sees New Orders Instantly  
If a new order is placed, the backend emits a `neworder` event via Socket.io.  
The dashboard listens for this event and refreshes the order list automatically.

### Step 4: Admin Reviews and Accepts/Rejects Orders  
Admin can click on an order to see details (including prescription).  
Admin clicks “Accept” or “Reject.”  
The frontend sends:  
- `POST /api/admin/orders/update` (with order ID and new status)

### Step 5: Backend Updates Order Status  
**Backend:**  
Receives the update in `server/routes/admin/orders-routes.js`.  
Logic in `server/controllers/admin/orders-controller.js`.  
Updates the order status in the database.

### Step 6: Real-Time Notification to User  
The backend emits a Socket.io event (`order_accepted` or `order_rejected`) to the user.  
The user’s frontend listens for this event and updates the order status instantly.

---

## 🔄 7. Real-Time Updates (Socket.io)

### How It Works  
Both admin and user clients connect to the backend using **Socket.io (websockets)**.  
When important events happen (like a new order or order status change), the backend sends a message to the relevant clients.

This means:  
- Admins see new orders appear instantly, without refreshing.  
- Users see their order status update in real time.

---

## 🔁 8. Navigation and State Updates

- **After Login/Register:**  
  User is redirected to the home page or dashboard.

- **After Order Placement:**  
  User is shown a confirmation page.

- **After Admin Accepts/Rejects:**  
  User sees the updated order status immediately.

- **After Image/Product Changes:**  
  Admin dashboard refreshes to show the latest data.

---

## 📊 9. Summary Table (End-to-End Example)

| Action                        | Frontend Page/Component     | API Called                          | Backend Logic/DB Change           | Real-Time | Next Navigation/Update             |
|------------------------------|-----------------------------|-------------------------------------|----------------------------------|-----------|------------------------------------|
| User logs in                 | `login.jsx`                 | POST `/api/auth/login`             | Auth controller                  | ❌         | Redirect to home/dashboard         |
| User uploads prescription    | `checkout.jsx`              | POST `/upload`                     | Saves file, returns URL          | ❌         | File URL used in order             |
| User places order            | `checkout.jsx`              | POST `/api/shop/order/add`         | Saves order                      | ✅         | Show confirmation, admin notified  |
| Admin sees new order         | `dashboard.jsx`             | GET `/api/admin/orders`            | Reads from DB                    | ✅         | Order list updates instantly       |
| Admin accepts/rejects order  | `dashboard.jsx`             | POST `/api/admin/orders/update`    | Updates order status             | ✅         | User sees status update            |


