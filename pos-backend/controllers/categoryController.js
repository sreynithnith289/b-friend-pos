const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");

// Create category
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return next(createHttpError(400, "Category name is required"));
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return next(createHttpError(400, "Category already exists"));
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      image: image || "",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// Get single category
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return next(createHttpError(404, "Category not found"));
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return next(createHttpError(404, "Category not found"));
    }

    // Check if new name already exists (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name: name.trim() });
      if (existingCategory) {
        return next(createHttpError(400, "Category name already exists"));
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name?.trim() || category.name,
        description:
          description !== undefined ? description : category.description,
        image: image !== undefined ? image : category.image,
        isActive: isActive !== undefined ? isActive : category.isActive,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return next(createHttpError(404, "Category not found"));
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
