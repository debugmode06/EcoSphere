const Category = require('../models/Category');

async function createCategory({ name, description, status, createdBy }) {
  const existing = await Category.findOne({ name });
  if (existing) {
    throw new Error('Category name already exists');
  }

  const category = new Category({
    name,
    description,
    status,
    createdBy,
  });

  await category.save();
  return category;
}

async function getCategories(filters = {}) {
  return Category.find(filters).populate('createdBy', 'name email role');
}

async function getCategoryById(id) {
  const category = await Category.findById(id).populate('createdBy', 'name email role');
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
}

async function updateCategory(id, { name, description, status }) {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }

  if (name && name !== category.name) {
    const existing = await Category.findOne({ name });
    if (existing) {
      throw new Error('Category name already exists');
    }
    category.name = name;
  }

  if (description !== undefined) category.description = description;
  if (status !== undefined) category.status = status;

  await category.save();
  return category;
}

async function deleteCategory(id) {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }

  // Delete the category
  await Category.findByIdAndDelete(id);
  return category;
}

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
