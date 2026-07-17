import { Request, Response } from 'express'
import { categoryService } from '../services/category.service'

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const categories = await categoryService.getAllCategories()
        return res.status(200).json({
            success: true,
            data: categories
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
}

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params
        const category = await categoryService.getCategoryById(id)

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            })
        }

        // Get product count
        const { productCount } = await categoryService.getCategoryWithProductCount(id)

        return res.status(200).json({
            success: true,
            data: {
                ...category,
                productCount
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
}

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = async (req: Request, res: Response): Promise<Response> => {
    try {
        const category = await categoryService.getCategoryBySlug(req.params.slug)

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: category
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
}

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const category = await categoryService.createCategory(req.body)
        return res.status(201).json({
            success: true,
            data: category,
            message: 'Category created successfully'
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
}

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params
        const category = await categoryService.updateCategory(id, req.body)

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: category,
            message: 'Category updated successfully'
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
}

// @desc    Delete category (Soft delete)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params
        await categoryService.deleteCategory(id)

        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
}

// @desc    Hard delete category
// @route   DELETE /api/categories/:id/hard
// @access  Private/Admin
export const hardDeleteCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params
        await categoryService.hardDeleteCategory(id)

        return res.status(200).json({
            success: true,
            message: 'Category permanently deleted'
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
}

// @desc    Bulk delete categories
// @route   DELETE /api/categories/bulk
// @access  Private/Admin
export const bulkDeleteCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { ids } = req.body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of category IDs'
            })
        }

        const result = await categoryService.bulkDeleteCategories(ids)

        return res.status(200).json({
            success: true,
            data: result,
            message: `Deleted ${result.deleted} categories. ${result.failed.length} failed.`
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
}

// @desc    Toggle category status
// @route   PUT /api/categories/:id/toggle
// @access  Private/Admin
export const toggleCategoryStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params
        const category = await categoryService.toggleCategoryStatus(id)

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: category,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
}

// @desc    Get categories with product counts
// @route   GET /api/categories/with-counts
// @access  Public
export const getCategoriesWithCounts = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const categories = await categoryService.getAllCategoriesWithProductCounts()
        return res.status(200).json({
            success: true,
            data: categories
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
}