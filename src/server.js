import dotenv from "dotenv";
import express from 'express';
import mongoose from "mongoose";
import studentRoutes from "./routes/studentRoutes.js";

dotenv.config();

const app = express();
const port = 8080;

app.use(express.json());
app.use(studentRoutes);
app.use((req, res) => {
    res.status(404).type('text/plain; charset=utf-8').send('Not Found');
})

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DB_NAME,
        });
        console.log("Connected to MongoDB");
        app.listen(port, () => {
            console.log(`Server started on port ${port}. Press Ctrl-C to finish`);
        })
    } catch (err) {
        console.log('Failed to connect to MongoDB', err);
    }
}

startServer();

