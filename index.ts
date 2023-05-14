import express, { Express } from 'express';
import dotenv from 'dotenv';
import 'express-async-errors';
import morgan from 'morgan';
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
import cloudinary from 'cloudinary';

dotenv.config();

const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// cloudinaryV2.api.resources(
//   { type: 'upload', prefix: 'NTH-Store/' },
//   function (error, result) {
//     console.log(result);
//   },
// );

const app: Express = express();
const port = process.env.PORT || 5000;

// middleware
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL!);
    app.listen(port, () =>
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();
