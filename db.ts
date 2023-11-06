import mongoose from "mongoose";

const url: string = 'mongodb+srv://okaforchidubem7:DeXtErJoNsOn12@cluster0.thej4dz.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(url)
// Check for successful connection
export const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

