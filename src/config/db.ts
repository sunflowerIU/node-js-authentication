import mongoose from "mongoose";

export async function connectToDB() {
  try {
    // biome-ignore lint/style/noNonNullAssertion: <>
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MONGODB connected succesfully.");
  } catch (error) {
    console.error("MONGODB connection error:-  ", error);
    process.exit(1);
  }
}
