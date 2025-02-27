
## Get started

1. Install dependencies

   ```bash
   npm install
   npx expo install react-dom react-native-web @expo/metro-runtime
   ```

2. Start the app

   ```bash
    npx expo start
   ```



3. unstall package 

   ```bash
            npm uninstall package 

   ```


4. cheack updates of installed packages 

   ```bash
             npx expo install --check 
             //then it asks you to  do the nesusary  update or not 

   ```




## presentation of the app 
![all screens should look like this ]()


## vs code snippet

go to file/preferences/configure snippet chose the languege and crete your own snippet


The conception of this mobile app store with the database sql lite : **User**, **Categories**, **Listings**, **Notifications**, and **Images**. 

---

### 1. **Database Tables and Relationships**

#### **User Table**
This table stores information about the users of your app (both buyers and sellers).

| Column Name       | Data Type        | Description                                      |
|--------------------|------------------|--------------------------------------------------|
| `user_id`         | INT (Primary Key)| Unique identifier for each user.                 |
| `username`        | VARCHAR(50)      | Username for login or display.                  |
| `email`           | VARCHAR(100)     | User's email address.                           |
| `password_hash`   | VARCHAR(255)     | Hashed password for security.                   |
| `phone_number`    | VARCHAR(15)      | User's contact number.                          |
| `created_at`      | DATETIME         | Timestamp when the user account was created.    |
| `updated_at`      | DATETIME         | Timestamp when the user account was last updated.|

---

#### **Categories Table**
This table stores the categories of items that can be listed in your app.

| Column Name       | Data Type        | Description                                      |
|--------------------|------------------|--------------------------------------------------|
| `category_id`     | INT (Primary Key)| Unique identifier for each category.            |
| `name`            | VARCHAR(100)     | Name of the category (e.g., Electronics, Books).|
| `description`     | TEXT             | Optional description of the category.           |
| `created_at`      | DATETIME         | Timestamp when the category was created.        |

---

#### **Listings Table**
This table stores the items listed for sale by users.

| Column Name       | Data Type        | Description                                      |
|--------------------|------------------|--------------------------------------------------|
| `listing_id`      | INT (Primary Key)| Unique identifier for each listing.             |
| `user_id`         | INT (Foreign Key)| ID of the user who created the listing.         |
| `category_id`     | INT (Foreign Key)| ID of the category the listing belongs to.      |
| `title`           | VARCHAR(100)     | Title of the listing.                           |
| `description`     | TEXT             | Detailed description of the item.               |
| `price`           | DECIMAL(10, 2)   | Price of the item.                              |
| `status`          | ENUM('active', 'sold', 'inactive') | Status of the listing. |
| `created_at`      | DATETIME         | Timestamp when the listing was created.         |
| `updated_at`      | DATETIME         | Timestamp when the listing was last updated.    |

---

#### **Images Table**
This table stores images associated with listings.

| Column Name       | Data Type        | Description                                      |
|--------------------|------------------|--------------------------------------------------|
| `image_id`        | INT (Primary Key)| Unique identifier for each image.               |
| `listing_id`      | INT (Foreign Key)| ID of the listing the image belongs to.         |
| `image_url`       | VARCHAR(255)     | URL or path to the image file.                  |
| `created_at`      | DATETIME         | Timestamp when the image was uploaded.          |

---

#### **Notifications Table**
This table stores notifications sent to users (e.g., new messages, sold items, etc.).

| Column Name       | Data Type        | Description                                      |
|--------------------|------------------|--------------------------------------------------|
| `notification_id` | INT (Primary Key)| Unique identifier for each notification.        |
| `user_id`         | INT (Foreign Key)| ID of the user receiving the notification.      |
| `message`         | TEXT             | Content of the notification.                    |
| `is_read`         | BOOLEAN          | Whether the notification has been read.         |
| `created_at`      | DATETIME         | Timestamp when the notification was created.    |

---

### 2. **Relationships Between Tables**
- **User ↔ Listings**: A user can create multiple listings (`user_id` in `Listings` references `user_id` in `User`).
- **Categories ↔ Listings**: A listing belongs to one category (`category_id` in `Listings` references `category_id` in `Categories`).
- **Listings ↔ Images**: A listing can have multiple images (`listing_id` in `Images` references `listing_id` in `Listings`).
- **User ↔ Notifications**: A user can receive multiple notifications (`user_id` in `Notifications` references `user_id` in `User`).

---
