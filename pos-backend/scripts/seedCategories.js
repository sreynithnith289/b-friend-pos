const mongoose = require("mongoose");
require("dotenv").config();
const Category = require("../models/categoryModel");
const categories = [
  { name: "បុកល្ហុង", description: "Papaya Salad" },
  { name: "ងាវ", description: "Cockle" },
  { name: "ភេសជ្ជៈ និងស្រា", description: "Beverages and Alcohol" },
  { name: "ក្តាម", description: "Crab" },
  { name: "បង្គា", description: "Shrimp" },
  { name: "មឹក", description: "Octopus" },
  { name: "សាច់គោ", description: "Beef" },
  { name: "មាន់", description: "Chicken" },
  { name: "អន្ទង់ និងទា", description: "Eel and Duck" },
  { name: "គ្រឿងក្លែម", description: "Side Dishes" },
  { name: "បាយឆា និងមីឆា", description: "Fried Rice and Noodles" },
  { name: "សាច់អាំង និងស៊ុប", description: "Grilled Meat and Soup" },
];
const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
    // Clear existing categories (optional)
    await Category.deleteMany({});
    console.log("🗑️ Cleared existing categories");
    // Insert new categories
    const result = await Category.insertMany(categories);
    console.log(`✅ Added ${result.length} categories`);
    console.log("\n📋 Categories added:");
    result.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} - ${cat.description}`);
    });
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};
seedCategories();
