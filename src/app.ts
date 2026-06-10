import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import requireAuth from "./middleware/requireAuth";
import checkAdmin from "./middleware/checkAdmin";
import adminRouter from "./routes/admin.routes";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/user", requireAuth, userRouter);
app.use("/admin", requireAuth, checkAdmin, adminRouter);

export default app;
