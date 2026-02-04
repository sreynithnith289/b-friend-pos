const Dish = require("../models/dishModel");
const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");
const EXCHANGE_RATE = 4100; // 1 USD = 4100 KHR
// Create dish
const createDish = async (req, res, next) => {
  try {
    const {
      name,
      description,
      priceKHR,
      priceUSD,
      category,
      image,
      preparationTime,
    } = req.body;
    if (!name || !category) {
      return next(createHttpError(400, "Name and category are required"));
    }
    if (!priceKHR && !priceUSD) {
      return next(
        createHttpError(400, "Price is required (priceKHR or priceUSD)")
      );
    }
    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(createHttpError(404, "Category not found"));
    }
    // Calculate both prices
    let finalPriceKHR = priceKHR;
    let finalPriceUSD = priceUSD;

    if (priceKHR && !priceUSD) {
      finalPriceUSD = parseFloat((priceKHR / EXCHANGE_RATE).toFixed(2));
    } else if (priceUSD && !priceKHR) {
      finalPriceKHR = Math.round(priceUSD * EXCHANGE_RATE);
    }

    const dish = await Dish.create({
      name: name.trim(),
      description: description || "",
      priceKHR: finalPriceKHR,
      priceUSD: finalPriceUSD,
      category,
      image: image || "",
      preparationTime: preparationTime || 15,
    });

    // Populate category in response
    const populatedDish = await Dish.findById(dish._id).populate(
      "category",
      "name"
    );

    res.status(201).json({
      success: true,
      message: "Dish created successfully",
      data: populatedDish,
    });
  } catch (error) {
    next(error);
  }
};

// Get all dishes
const getDishes = async (req, res, next) => {
  try {
    const { category, available } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.isAvailable = available === "true";

    const dishes = await Dish.find(filter)
      .populate("category", "name")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: dishes,
    });
  } catch (error) {
    next(error);
  }
};

// Get single dish
const getDishById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findById(id).populate("category", "name");
    if (!dish) {
      return next(createHttpError(404, "Dish not found"));
    }

    res.status(200).json({
      success: true,
      data: dish,
    });
  } catch (error) {
    next(error);
  }
};

// Get dishes by category
const getDishesByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const dishes = await Dish.find({ category: categoryId, isAvailable: true })
      .populate("category", "name")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: dishes,
    });
  } catch (error) {
    next(error);
  }
};

// Update dish
const updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      priceKHR,
      priceUSD,
      category,
      image,
      isAvailable,
      preparationTime,
    } = req.body;

    const dish = await Dish.findById(id);
    if (!dish) {
      return next(createHttpError(404, "Dish not found"));
    }

    // Verify category exists if being updated
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return next(createHttpError(404, "Category not found"));
      }
    }

    // Calculate prices if only one is provided
    let finalPriceKHR = priceKHR !== undefined ? priceKHR : dish.priceKHR;
    let finalPriceUSD = priceUSD !== undefined ? priceUSD : dish.priceUSD;

    if (priceKHR !== undefined && priceUSD === undefined) {
      finalPriceUSD = parseFloat((priceKHR / EXCHANGE_RATE).toFixed(2));
    } else if (priceUSD !== undefined && priceKHR === undefined) {
      finalPriceKHR = Math.round(priceUSD * EXCHANGE_RATE);
    }

    const updatedDish = await Dish.findByIdAndUpdate(
      id,
      {
        name: name?.trim() || dish.name,
        description: description !== undefined ? description : dish.description,
        priceKHR: finalPriceKHR,
        priceUSD: finalPriceUSD,
        category: category || dish.category,
        image: image !== undefined ? image : dish.image,
        isAvailable: isAvailable !== undefined ? isAvailable : dish.isAvailable,
        preparationTime:
          preparationTime !== undefined
            ? preparationTime
            : dish.preparationTime,
      },
      { new: true }
    ).populate("category", "name");

    res.status(200).json({
      success: true,
      message: "Dish updated successfully",
      data: updatedDish,
    });
  } catch (error) {
    next(error);
  }
};

// Delete dish
const deleteDish = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findById(id);
    if (!dish) {
      return next(createHttpError(404, "Dish not found"));
    }

    await Dish.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Dish deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Toggle dish availability
const toggleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findById(id);
    if (!dish) {
      return next(createHttpError(404, "Dish not found"));
    }

    dish.isAvailable = !dish.isAvailable;
    await dish.save();

    res.status(200).json({
      success: true,
      message: `Dish is now ${dish.isAvailable ? "available" : "unavailable"}`,
      data: dish,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDish,
  getDishes,
  getDishById,
  getDishesByCategory,
  updateDish,
  deleteDish,
  toggleAvailability,
};
