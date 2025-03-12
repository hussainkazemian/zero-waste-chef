import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initializeDatabase } from './db';
import authRoutes from './routes/auth';
import recipeRoutes from './routes/recipes';
import ingredientsRoutes from './routes/ingredients';
import commentsRoutes from './routes/comments';
import likesRoutes from './routes/likes';
import userRoutes from './routes/user';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  },
}));

app.use(cors());

app.use(express.json());

// Error handling middleware
interface CustomError extends Error {
  status?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});


app.use('/api/auth', authRoutes);
app.use('/api', recipeRoutes);
app.use('/api', ingredientsRoutes);
app.use('/api', commentsRoutes);
app.use('/api', likesRoutes);
app.use('/api', userRoutes);


// Start server
async function startServer() {
  const db = await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
  });
}

startServer();
// import express, { Request, Response, NextFunction } from 'express';
// import cors from 'cors';  // Importing CORS
// import { initializeDatabase } from './db';
// import authRoutes from './routes/auth';
// import recipeRoutes from './routes/recipes';
// import ingredientsRoutes from './routes/ingredients';
// import commentsRoutes from './routes/comments';
// import likesRoutes from './routes/likes';
// import userRoutes from './routes/user';
// import dotenv from 'dotenv';
// import path from 'path';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // CORS configuration
// app.use(cors({
//   origin: 'https://users.metropolia.fi',  // Allow your frontend domain
//   credentials: true,  // If you need cookies or authentication headers, you can keep this
// }));

// // Serve uploaded images (static files)
// app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads'), {
//   setHeaders: (res, filePath) => {
//     if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
//       res.setHeader('Content-Type', 'image/jpeg');
//     } else if (filePath.endsWith('.png')) {
//       res.setHeader('Content-Type', 'image/png');
//     }
//   },
// }));

// // Body parsing middleware
// app.use(express.json());

// // API routes
// app.use('/api/auth', authRoutes);
// app.use('/api', recipeRoutes);
// app.use('/api', ingredientsRoutes);
// app.use('/api', commentsRoutes);
// app.use('/api', likesRoutes);
// app.use('/api', userRoutes);

// // Error handling middleware
// interface CustomError extends Error {
//   status?: number;
// }

// app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
//   res.status(err.status || 500).json({
//     message: err.message || 'Internal Server Error',
//   });
// });

// // Start the server
// async function startServer() {
//   const db = await initializeDatabase();
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// }

// startServer();
