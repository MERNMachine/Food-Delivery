import mongoose from 'mongoose';

// Define the SubCategory schema
const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { timestamps: true });

// Create the SubCategory model
const SubCategory = mongoose.models.SubCategory || mongoose.model('SubCategory', subCategorySchema);

// Define the Category schema
const categorySchema = new mongoose.Schema({
  main: { type: String, required: true },
  sub: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }],
}, { timestamps: true });

// Create the Category model
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export { Category, SubCategory };