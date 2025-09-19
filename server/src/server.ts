
import express from "express";
import cors from 'cors';
import helmet from "helmet";
import config from "./config";
import { limiter } from "./middleware/rateLimiter";


const app = express();
const PORT = Number(config.PORT || 4000);

app.use(helmet());

app.use(cors({
    origin: config.allowedOrigins
}));

app.use(limiter);

app.get('/health', (_req, res) => {
    res.json({ status: 'Running'})
});

app.listen(PORT, ()=> {
    console.log(`transcribe server — express running. Port: ${PORT}`);
})


// const PORT = process.env.PORT || 4000;
// console.log(`transcribe server — dev boot (no runtime frameworks installed). Port: ${PORT}`);