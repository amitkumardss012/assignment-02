import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import errorMiddleware from "./middlewares/error.middleware.js";
import connectDB from "./lib/db.js";
import itemRoutes from "./routes/item.route.js";
import invoiceRoutes from "./routes/invoice.route.js";
import { ENV } from "./lib/env.js";

const app = express();

connectDB()

app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors())


app.use(
  rateLimit({
    windowMs: 15 * 60 * 100000, // 15 minutes
    max: 3000, // limit each IP to 100 requests per windowMs
    message: {
      status: 429,
      message: "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/", (req, res) => {
    res.json({
        message: "Hello World!",
        success: true,
        timestamp: new Date().toISOString(),
        mode: process.env.MODE || "development"
    });
});


// Routes
app.use("/api/v1/item", itemRoutes);
app.use("/api/v1/invoice", invoiceRoutes);

// error handler
app.use(errorMiddleware)


app.listen(ENV.PORT, () => {
    console.log(`Server started on port ${ENV.PORT}`);
});