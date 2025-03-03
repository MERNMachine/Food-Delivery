import mongoose from "mongoose";

const systemuserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  }); 

const systemuserModel = mongoose.model.systemuser || mongoose.model("systemuser", systemuserSchema);
export default systemuserModel;
