import express from 'express';
import cors from 'cors';
import stripeRoutes from './stripe';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: import.meta.env.VITE_APP_URL,
  methods: ['GET', 'POST'],
}));

app.use(express.json());
app.use('/api', stripeRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});