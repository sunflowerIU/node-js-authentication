import dotenv from "dotenv";
dotenv.config();
import http from "node:http";
import { connectToDB } from "./config/db";

import app from "./app";

const port = process.env.PORT;

async function startServer() {
  await connectToDB();

  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`server listening at port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("error while starting the server:- ", error);
});
