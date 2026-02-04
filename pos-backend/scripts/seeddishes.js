const mongoose = require("mongoose");
require("dotenv").config();
const Dish = require("../models/dishModel");
const Category = require("../models/categoryModel");
const EXCHANGE_RATE = 4100; // 1 USD = 4100 KHR
const dishesData = {
  បុកល្ហុង: [
    {
      name: "បុកល្ហុងខ្យង",
      description: "Papaya Salad with Snail",
      priceKHR: 25000,
    },
    {
      name: "បុកល្ហុងសាល់ម៉ុន",
      description: "Papaya Salad with Salmon",
      priceKHR: 28000,
    },
    {
      name: "បុកល្ហុងដៃមឹក",
      description: "Papaya Salad with Octopus",
      priceKHR: 32000,
    },
    {
      name: "បុកល្ហុង Hotdog",
      description: "Papaya Salad with Hotdog",
      priceKHR: 26000,
    },
    {
      name: "បុកល្ហុងក្តាមសេះ",
      description: "Papaya Salad with Sea Crab",
      priceKHR: 30000,
    },
    {
      name: "បុកល្ហុងក្តាមស្រែ",
      description: "Papaya Salad with Field Crab",
      priceKHR: 27000,
    },
    {
      name: "បុកល្ហុងជើងមាន់",
      description: "Papaya Salad with Chicken Feet",
      priceKHR: 27000,
    },
    {
      name: "បុកល្ហុងបង្គា",
      description: "Papaya Salad with Shrimp",
      priceKHR: 30000,
    },
    {
      name: "បុកល្ហុងឈុតបីសាសន៍",
      description: "Mixed Papaya Salad Set",
      priceKHR: 60000,
    },
  ],
  ងាវ: [
    { name: "ងាវស្រុះ", description: "Steamed Cockle", priceKHR: 15000 },
    {
      name: "ងាវអប់អំបិលម្ទេស",
      description: "Cockle with Salt and Pepper",
      priceKHR: 17000,
    },
    { name: "ភ្លាងាវ", description: "Cockle Salad", priceKHR: 14000 },
    {
      name: "ងាវឆាអំពិលទុំ",
      description: "Fried Cockle with Tamarind",
      priceKHR: 20000,
    },
  ],
  "ភេសជ្ជៈ និងស្រា": [
    { name: "កូកា កូឡា", description: "Coca Cola", priceKHR: 7000 },
    { name: "Sting", description: "Sting Energy Drink", priceKHR: 8000 },
    {
      name: "Boostrong",
      description: "Boostrong Energy Drink",
      priceKHR: 8000,
    },
    { name: "ទឹកផ្លែឈើ", description: "Fruit Juice", priceKHR: 8000 },
    { name: "Idol", description: "Idol Drink", priceKHR: 6500 },
    { name: "Krud", description: "Krud Energy Drink", priceKHR: 6000 },
    { name: "Wurkz", description: "Wurkz Drink", priceKHR: 4000 },
    {
      name: "ហនុមានទឹក(ដប)",
      description: "Hanuman Beer (Bottle)",
      priceKHR: 7000,
    },
    {
      name: "ហនុមានទឹកខ្មៅ(ដប)",
      description: "Hanuman Black Beer (Bottle)",
      priceKHR: 8000,
    },
    { name: "ទឹកសុទ្ធ", description: "Drinking Water", priceKHR: 6000 },
    {
      name: "ហនុមានទឹកស(កំប៉ុង)",
      description: "Hanuman White Can",
      priceKHR: 4000,
    },
    {
      name: "ហនុមានទឹកខ្មៅ(កំប៉ុង)",
      description: "Hanuman Black Can",
      priceKHR: 4500,
    },
    {
      name: "ថៃហ្គ័រគ្រីសស្តាល់(កំប៉ុង)",
      description: "Tiger Crystal Can",
      priceKHR: 3500,
    },
    {
      name: "ថៃហ្គ័រគ្រីសស្តាល់(ដប)",
      description: "Tiger Crystal Bottle",
      priceKHR: 3500,
    },
    { name: "ស្រាបៀរកម្ពុជា", description: "Cambodia Beer", priceKHR: 5000 },
    {
      name: "ស្រាបៀរកម្ពុជា Lite",
      description: "Cambodia Light Beer",
      priceKHR: 5500,
    },
    { name: "ស្រាបៀរអាន់ឆឺរ", description: "Anchor Beer", priceKHR: 6000 },
    { name: "អាន់ឆឺរ​​ white", description: "Anchor White", priceKHR: 6500 },
    { name: "ស្រាកូរ៉េ", description: "Korean Soju", priceKHR: 6500 },
  ],
  ក្តាម: [
    {
      name: "ក្តាមអប់មីសួ",
      description: "Crab with Noodle Soup",
      priceKHR: 4000,
    },
    {
      name: "ក្តាមឆាជូរអែម",
      description: "Sweet and Sour Crab",
      priceKHR: 5000,
    },
    { name: "ក្តាមចំហ៊ុយ", description: "Steamed Crab", priceKHR: 6000 },
    { name: "ភ្លាក្តាម", description: "Crab Salad", priceKHR: 6000 },
  ],
  បង្គា: [
    {
      name: "បង្គាអប់មីសួ",
      description: "Shrimp with Noodle Soup",
      priceKHR: 12000,
    },
    {
      name: "បង្គាបំពងខ្ទឹមស",
      description: "Shrimp Fried with Garlic",
      priceKHR: 15000,
    },
    {
      name: "បង្គាបំពងម្សៅ",
      description: "Crispy Fried Shrimp",
      priceKHR: 18000,
    },
    { name: "បង្គាស្រុះ", description: "Steamed Shrimp", priceKHR: 20000 },
    {
      name: "បង្គាឆាជូរអែម",
      description: "Sweet and Sour Shrimp",
      priceKHR: 18000,
    },
    {
      name: "បង្គាកោះកុង",
      description: "Koh Kong Style Shrimp",
      priceKHR: 20000,
    },
  ],
  មឹក: [
    {
      name: "មឹកឆាម្រេចខ្ចី",
      description: "Squid with Green Pepper",
      priceKHR: 35000,
    },
    {
      name: "មឹកឆាជូរអែម",
      description: "Sweet and Sour Squid",
      priceKHR: 40000,
    },
    {
      name: "មឹកឆាម្រេះព្រៅ",
      description: "Squid with Wild Pepper",
      priceKHR: 45000,
    },
    { name: "មឹកអាំង", description: "Grilled Squid", priceKHR: 50000 },
    {
      name: "មឹកបំពងខ្ទឹមស",
      description: "Squid Fried with Garlic",
      priceKHR: 45000,
    },
    { name: "មឹកបំពងម្សៅ", description: "Crispy Fried Squid", priceKHR: 50000 },
  ],
  សាច់គោ: [
    {
      name: "សាច់គោឆាអង្គ្រងកាឆែត",
      description: "Beef with Oyster Sauce",
      priceKHR: 20000,
    },
    {
      name: "សាច់គោអាំងទឹកប្រហុក",
      description: "Grilled Beef with Prohok",
      priceKHR: 20000,
    },
    {
      name: "បុកសាច់គោសណ្តែកកួ",
      description: "Pounded Beef with Beans",
      priceKHR: 15000,
    },
    {
      name: "សាច់គោខាត់ណាទឹកភ្នែក",
      description: "Raw Beef Salad",
      priceKHR: 20000,
    },
    {
      name: "ភ្លាសាច់គោត្រយ៉ូងចេក",
      description: "Beef Salad with Banana Flower",
      priceKHR: 20000,
    },
    { name: "ងៀតគោ", description: "Beef Jerky", priceKHR: 20000 },
  ],
  មាន់: [
    {
      name: "មាន់លីងប្រៃផ្អេម",
      description: "Sweet Fried Chicken",
      priceKHR: 15000,
    },
    {
      name: "មាន់លីងគល់ស្លឹកគ្រៃ",
      description: "Lemongrass Fried Chicken",
      priceKHR: 15000,
    },
    {
      name: "មាន់ដុត(មាន់1)",
      description: "Grilled Chicken (Whole)",
      priceKHR: 50000,
    },
    {
      name: "មាន់ស្ងោរជ្រក់(មាន់1)",
      description: "Boiled Chicken (Whole)",
      priceKHR: 50000,
    },
    {
      name: "គ្រឿងក្នុងមាន់ឆាជូរអែម",
      description: "Sweet and Sour Chicken Giblets",
      priceKHR: 15000,
    },
    {
      name: "គ្រឿងក្នុងមាន់បំពង",
      description: "Fried Chicken Giblets",
      priceKHR: 15000,
    },
  ],
  "អន្ទង់ និងទា": [
    { name: "ឆាក្តៅអន្ទង់", description: "Spicy Fried Eel", priceKHR: 15000 },
    {
      name: "អន្ទង់អប់ត្រយ៉ូងចេក",
      description: "Eel with Banana Flower",
      priceKHR: 15000,
    },
    { name: "អន្ទង់អាំង", description: "Grilled Eel", priceKHR: 20000 },
    {
      name: "ទាឆាគ្រឿង",
      description: "Fried Duck with Spices",
      priceKHR: 20000,
    },
    { name: "ទាឆាក្តៅ", description: "Spicy Fried Duck", priceKHR: 20000 },
  ],
  គ្រឿងក្លែម: [
    {
      name: "ជើងមាន់លីងអំបិលម្ទេស",
      description: "Chicken Feet with Salt and Pepper",
      priceKHR: 15000,
    },
    {
      name: "ជើងមាន់បំពងខ្ទឹមស",
      description: "Chicken Feet Fried with Garlic",
      priceKHR: 15000,
    },
    { name: "ពោតលីង", description: "Fried Corn", priceKHR: 20000 },
    { name: "ពោតបំពង", description: "Crispy Corn", priceKHR: 20000 },
    {
      name: "ស្វាយញាំត្រីឆ្អើ",
      description: "Mango Salad with Dried Fish",
      priceKHR: 20000,
    },
    {
      name: "ភ្លាបង្គាក្រៀម",
      description: "Dried Shrimp Salad",
      priceKHR: 15000,
    },
    { name: "កំពឹសភ្លា", description: "Shrimp Paste Salad", priceKHR: 15000 },
    {
      name: "បុកកំពឹសម្ជូរខ្ចី",
      description: "Pounded Shrimp with Sour Soup",
      priceKHR: 20000,
    },
    { name: "កំពឹសលីង", description: "Fried Shrimp Paste", priceKHR: 20000 },
    {
      name: "ប្រហិតត្រីឆ្លាត",
      description: "Smart Fish Balls",
      priceKHR: 20000,
    },
    {
      name: "ពោះតាន់ឆាម្រេចខ្ចី",
      description: "Tripe with Green Pepper",
      priceKHR: 20000,
    },
    {
      name: "ពោះតាន់ឆាស្ពៃជ្រក់",
      description: "Tripe with Pickled Cabbage",
      priceKHR: 20000,
    },
  ],
  "បាយឆា និងមីឆា": [
    {
      name: "បាយឆាគ្រឿងសមុទ្រ",
      description: "Seafood Fried Rice",
      priceKHR: 15000,
    },
    { name: "បាយឆាសាច់គោ", description: "Beef Fried Rice", priceKHR: 15000 },
    { name: "បាយឆា៧៩", description: "79 Fried Rice", priceKHR: 50000 },
    { name: "មីឆាសាច់គោ", description: "Beef Fried Noodles", priceKHR: 50000 },
    {
      name: "មីឆាគ្រឿងសមុទ្រ",
      description: "Seafood Fried Noodles",
      priceKHR: 15000,
    },
    { name: "មីឆាពងទា", description: "Egg Fried Noodles", priceKHR: 15000 },
  ],
  "សាច់អាំង និងស៊ុប": [
    { name: "ស៊ុបយៅហ៊ន", description: "Yao Hon Soup", priceKHR: 15000 },
    {
      name: "ស៊ុបប្រហិតត្រីឆ្លាត",
      description: "Fish Ball Soup",
      priceKHR: 15000,
    },
    { name: "សាច់គោត្រកួន", description: "Beef Trakuon", priceKHR: 50000 },
    {
      name: "គោឡើងភ្នំ",
      description: "Beef Climbing Mountain",
      priceKHR: 50000,
    },
    {
      name: "ឈុតសាច់អាំង​ និងស៊ុប",
      description: "Grilled Meat and Soup Set",
      priceKHR: 15000,
    },
    {
      name: "នំបញ្ចុកត្រីអណ្តែង",
      description: "Fish Noodle Soup",
      priceKHR: 15000,
    },
  ],
};
const seedDishes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
    // Clear existing dishes
    await Dish.deleteMany({});
    console.log("🗑️ Cleared existing dishes");
    // Get all categories
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });
    console.log("\n📋 Categories found:", Object.keys(categoryMap).length);
    // Insert dishes
    let totalDishes = 0;
    for (const [categoryName, dishes] of Object.entries(dishesData)) {
      const categoryId = categoryMap[categoryName];
      if (!categoryId) {
        console.log(`⚠️ Category not found: ${categoryName}`);
        continue;
      }
      const dishesWithCategory = dishes.map((dish) => ({
        name: dish.name,
        description: dish.description,
        priceKHR: dish.priceKHR,
        priceUSD: parseFloat((dish.priceKHR / EXCHANGE_RATE).toFixed(2)),
        category: categoryId,
      }));

      await Dish.insertMany(dishesWithCategory);
      console.log(`✅ Added ${dishes.length} dishes to "${categoryName}"`);
      totalDishes += dishes.length;
    }
    console.log(`\n🎉 Total dishes added: ${totalDishes}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};
seedDishes();
