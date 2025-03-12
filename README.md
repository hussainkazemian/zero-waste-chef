# Zero_Waste_Chef

Zero Waste Chef is a web application designed to help users minimize food waste by providing a platform to manage recipes, track ingredients, and engage with a community of like-minded individuals. The app encourages users to utilize the ingredients they have at home through simple and effective recipes, thereby reducing food waste and promoting sustainable living.

## Why Use Zero_Waste_Chef?

- **Reduce Food Waste**: Helps users make the most of the ingredients they already have, reducing unnecessary food waste.
- **Community Engagement**: Allows users to share recipes, comment on others' creations, and engage in a community focused on sustainability.
- **Easy Recipe Management**: Provides tools to add, edit, and manage recipes with detailed instructions and images.
- **User-Friendly Interface**: Built with modern technologies to ensure a smooth and intuitive user experience.

## Key Features

1. **User Registration and Authentication**:
   - Users can create accounts and log in to access personalized features.
   - Secure password handling with hashing and JWT for authentication.

2. **Recipe Management by Admin**:
   - Add, edit, and delete recipes with detailed descriptions, ingredients, and instructions.
   - Only the recipe creator can modify or delete their recipes.

3. **Commenting and Liking**:
   - Users can comment on recipes, including text and video links.
   - Like or dislike recipes and comments.

4. **Profile and Activities**:
   - View and manage personal information and activities.
   - Track likes, comments, and recipes added.

5. **Password Recovery**:
   - Users can recover their passwords via email with a secure link to reset their password. 

6. **Admin Capabilities**:
   - Admin users have full control over the app, including modifying, removing, and managing all user data and recipes.

7. **Home Page**:
   - Displays recipe details, including title, description,  type, allergies (if mentioned), and the recipes's information.

8. **Notifications**:
   - Comments display timestamps.

## Technology Stack

- **Frontend**:
  - **React**: For building the user interface with components.
  - **TypeScript**: For type safety and better code maintainability.
  - **Vite**: As the build tool for a faster and leaner development experience.
  - **Tailwind CSS**: For styling the application with utility-first CSS. (Not completely)
  - **React Hook Form**: For form handling and validation.
  - **Zustand**: For state management.

- **Backend**:
  - **Node.js**: For server-side scripting.
  - **Express.js**: For building the REST API.
  - **SQLite**: As the database for storing user and recipe data.
  - **JWT**: For secure user authentication.

- **Testing**:
  - **Jest**: For unit testing and integration testing.
  - **React Testing Library**: For testing React components.
  - **Vitest**: For Vite-native testing.

- **Development Tools**:
  - **ESLint and Prettier**: For code linting and formatting.
  - **.editorconfig**: For consistent coding styles across different editors.

## How to Run the App

### Prerequisites

- Node.js and npm installed on your machine.
- SQLite for database operations.

### Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd zero-waste-chef

 ### Install Dependencies:
 npm install
cd frontend
npm install

 ### Environment Variables:

Create a .env file in the backend directory with necessary environment variables, such as database paths and JWT secrets.

### Run the Backend Server:
cd backend
npm start

### Run the Frontend Development Server:
cd frontend
npm run dev

### Project Structure
## Backend: Contains the server logic, API routes, and database interactions.

db.ts: Database initialization and schema definitions.
server.ts: Main server file to start the Express server.
routes/: API routes for authentication, recipes, comments, etc.
controllers/: Handlers for API routes.
middleware/: Custom middleware for error handling and authentication.

## Frontend: Contains the React application.
App.tsx: Main application component.
pages/: Different pages of the application, such as Home, Login, Register, etc.
components/: Reusable components used across the application.