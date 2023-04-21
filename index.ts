import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import 'express-async-errors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import connectDB from './db/connect';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors());

app.use(express.static('./public'));
app.use(fileUpload());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL!);
    app.listen(port, () => console.log(`⚡️[server]: Server is running at http://localhost:${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
