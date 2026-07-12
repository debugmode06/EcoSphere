const categoryService = require('../services/categoryService');
const asyncHandler = require('../../../utils/asyncHandler');

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const category = await categoryService.createCategory({
    name,
    description,
    status,
    createdBy: req.user.id,
  });
  res.status(201).json({
    message: 'Category created successfully',
    category,
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories();
  res.status(200).json({ categories });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(200).json({ category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const category = await categoryService.updateCategory(req.params.id, { name, description, status });
  res.status(200).json({
    message: 'Category updated successfully',
    category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(200).json({
    message: 'Category deleted successfully',
  });
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
