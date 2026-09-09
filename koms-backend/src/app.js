import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import config from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'response successful' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;