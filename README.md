# Welcome to Jibobi3 your mobile sell app 👋
Jibobi3
Jibobi3 is a comprehensive listing application that allows users to create, view, and manage listings with ease. The app provides a user-friendly interface for browsing listings, viewing detailed information, and contacting listing owners. Key features include:

User Authentication: Secure user registration and login.
Listing Management: Create, update, and delete listings with images and detailed descriptions.
Image Handling: Upload and display multiple images for each listing.
Geolocation: Display the location of listings using coordinates.
Notifications: Receive notifications for important events related to listings.
Responsive Design: Optimized for both web and mobile devices.
Technologies Used
Front-End: React Native, Axios, Day.js
Back-End: Node.js, Express, Sequelize, SQLite
Geocoding: OpenStreetMap Nominatim API
Getting Started
To get started with the project, follow these steps:

Clone the repository:

Install dependencies for both the front-end and back-end:

Start the back-end server:

Start the front-end application:

Contributing
We welcome contributions from the community. Please read our contributing guidelines for more information.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Feel free to customize the description to better fit your project's specifics and requirements.


### 3. **Key Features to Implement**
1. **User Authentication**:
   - Allow users to register, log in, and manage their profiles.
   - Use secure password hashing (e.g., bcrypt).

2. **Category Management**:
   - Allow admin users to add, edit, or delete categories.

3. **Listing Management**:
   - Allow users to create, update, and delete listings.
   - Include search and filter functionality by category, price, etc.

4. **Image Upload**:
   - Allow users to upload multiple images for each listing.
   - Store image URLs in the `Images` table.

5. **Notifications**:
   - Send real-time or periodic notifications to users (e.g., "Your item has been sold").
   - Mark notifications as read when viewed.

6. **Admin Panel**:
   - Create an admin interface to manage users, categories, and listings.

---

### 4. **Tech Stack Suggestions**
- **Backend**: Node.js (Express), or PHP (Laravel).
- **Database**: MySQL, PostgreSQL, or MongoDB.
- **Frontend**: React Native (for cross-platform mobile apps) or Swift/Kotlin (for native apps).
- **Image Storage**: Cloud storage like AWS S3, Firebase Storage, or Cloudinary.
- **Notifications**: Firebase Cloud Messaging (FCM) for push notifications.



### app presentation :











### 6. **Next Steps**
1. **Wireframe Your App**:
   - Sketch out the user interface for key screens (e.g., home, listing details, user profile).

2. **Set Up Your Database**:
   - Create the tables and relationships in your chosen database.

3. **Develop Core Features**:
   - Start with user authentication, then move to listing and category management.

4. **Test and Iterate**:
   - Test your app with real users and gather feedback for improvements.

Let me know if you need help with specific parts of the implementation!


### 6. **OPTIMISATION BEFORE EAS **
      -
Before building your EAS APK (Expo Application Services APK), optimizing your React Native app can significantly improve performance, reduce app size, and enhance the user experience. Here are some key optimizations you should consider:

1. Optimize Assets
a. Compress Images
Use tools like TinyPNG or ImageOptim to compress images before adding them to your project.
Use appropriate image resolutions for different screen sizes (e.g., @2x, @3x).
b. Use Vector Icons
Replace large image icons with vector icons using libraries like react-native-vector-icons or @expo/vector-icons.
c. Lazy Load Assets
Use expo-asset to lazy load assets only when needed.
2. Reduce App Size
a. Remove Unused Dependencies
Audit your package.json and remove any unused libraries:
b. Minify JavaScript
Expo automatically minifies JavaScript during the build process, but ensure you’re not including unnecessary code or libraries.
c. Use Hermes (for Bare Workflow or EAS Build)
Hermes is a lightweight JavaScript engine that improves app performance and reduces APK size.
Enable Hermes in your eas.json:
3. Optimize Performance
a. Use FlatList Instead of ScrollView
Replace ScrollView with FlatList for rendering large lists to improve memory usage.
b. Avoid Inline Functions
Move inline functions out of JSX to avoid unnecessary re-renders.
c. Memoize Components
Use React.memo and useMemo to prevent unnecessary re-renders of components.
d. Optimize State Management
Avoid deeply nested states and use libraries like Redux or Recoil for better state management.
e. Remove Console Logs
Remove all console.log statements to avoid performance issues in production:
Add the plugin to your babel.config.js:
