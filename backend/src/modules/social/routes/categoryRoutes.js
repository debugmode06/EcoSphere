const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, requireRole } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { validateCreateCategory, validateUpdateCategory } = require('../validations/categoryValidation');

router.get('/', verifyToken, categoryController.getCategories);
router.get('/:id', verifyToken, categoryController.getCategoryById);

// Admin-only operations
router.post('/', verifyToken, requireRole('ADMIN'), validateCreateCategory, validate, categoryController.createCategory);
router.put('/:id', verifyToken, requireRole('ADMIN'), validateUpdateCategory, validate, categoryController.updateCategory);
router.delete('/:id', verifyToken, requireRole('ADMIN'), categoryController.deleteCategory);

module.exports = router;
