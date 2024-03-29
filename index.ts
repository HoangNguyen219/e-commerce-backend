import express, { Express } from 'express';
import dotenv from 'dotenv';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import connectDB from './db/connect';
import notFoundMiddleware from './middlewares/not-found';
import errorHandlerMiddleware from './middlewares/error-handler';
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import productRouter from './routes/productRoutes';
import categoryRouter from './routes/categoryRoutes';
import companyRouter from './routes/companyRoutes';
import reviewRouter from './routes/reviewRoutes';
import orderRouter from './routes/orderRoutes';
import addressRouter from './routes/addressRoute';
import configRouter from './routes/configRoutes';
import cloudinaryV2 from './service/cloudinary';

dotenv.config();

cloudinaryV2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app: Express = express();
const port = process.env.PORT || 5000;

// middleware
app.use(morgan('tiny'));

const allowedOrigins = [process.env.ORIGIN, process.env.ADMIN_ORIGIN];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(mongoSanitize());
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static('./public'));
app.use(fileUpload({ useTempFiles: true }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/companies', companyRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/addresses', addressRouter);
app.use('/api/v1/config', configRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(
      process.env.MONGO_URL ||
        'mongodb://localhost:27017/NTH-STORE?retryWrites=true&w=majority',
    );
    app.listen(port, () =>
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();
