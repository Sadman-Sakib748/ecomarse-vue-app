import Category from '../models/Category'
import { ICategory } from '../types'
import { Types } from 'mongoose'

// ==================== CATEGORY SERVICE ====================

class CategoryService {

    // Get all categories
    async getAllCategories(): Promise<ICategory[]> {
        try {
            const categories = await Category.find({ isActive: true })
                .sort({ sortOrder: 1, name: 1 })
                .lean()
            return categories
        } catch (error) {
            console.error('Error fetching categories:', error)
            throw new Error('Failed to fetch categories')
        }
    }

    // Get category by ID
    async getCategoryById(id: string): Promise<ICategory | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid category ID')
            }
            const category = await Category.findById(id).lean()
            return category
        } catch (error) {
            console.error('Error fetching category:', error)
            throw new Error('Failed to fetch category')
        }
    }

    // Get category by slug
    async getCategoryBySlug(slug: string): Promise<ICategory | null> {
        try {
            const category = await Category.findOne({ slug, isActive: true }).lean()
            return category
        } catch (error) {
            console.error('Error fetching category by slug:', error)
            throw new Error('Failed to fetch category')
        }
    }

    // Create category
    async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
        try {
            // Check if category already exists
            const existingCategory = await Category.findOne({
                $or: [
                    { name: categoryData.name },
                    { slug: categoryData.name?.toLowerCase().replace(/\s+/g, '-') }
                ]
            })

            if (existingCategory) {
                throw new Error('Category already exists with this name')
            }

            const category = await Category.create(categoryData)
            return category
        } catch (error) {
            console.error('Error creating category:', error)
            throw error
        }
    }

    // Update category
    async updateCategory(id: string, updateData: Partial<ICategory>): Promise<ICategory | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid category ID')
            }

            // Check if category exists
            const existingCategory = await Category.findById(id)
            if (!existingCategory) {
                throw new Error('Category not found')
            }

            // Check for duplicate name (if name is being updated)
            if (updateData.name && updateData.name !== existingCategory.name) {
                const duplicate = await Category.findOne({
                    name: updateData.name,
                    _id: { $ne: id }
                })
                if (duplicate) {
                    throw new Error('Category name already exists')
                }
            }

            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).lean()

            return updatedCategory
        } catch (error) {
            console.error('Error updating category:', error)
            throw error
        }
    }

    // Delete category (Soft delete - set isActive to false)
    async deleteCategory(id: string): Promise<boolean> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid category ID')
            }

            const category = await Category.findById(id)
            if (!category) {
                throw new Error('Category not found')
            }

            // Check if category has products
            const Product = require('../models/Product').default
            const productCount = await Product.countDocuments({ category: id, isPublished: true })

            if (productCount > 0) {
                throw new Error(`Cannot delete category with ${productCount} products. Please move or delete products first.`)
            }

            // Soft delete (set isActive to false)
            category.isActive = false
            await category.save()

            return true
        } catch (error) {
            console.error('Error deleting category:', error)
            throw error
        }
    }

    // Hard delete category (Permanent delete)
    async hardDeleteCategory(id: string): Promise<boolean> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid category ID')
            }

            const category = await Category.findById(id)
            if (!category) {
                throw new Error('Category not found')
            }

            // Check if category has products
            const Product = require('../models/Product').default
            const productCount = await Product.countDocuments({ category: id })

            if (productCount > 0) {
                throw new Error(`Cannot delete category with ${productCount} products. Please move or delete products first.`)
            }

            await category.deleteOne()
            return true
        } catch (error) {
            console.error('Error hard deleting category:', error)
            throw error
        }
    }

    // Bulk delete categories
    async bulkDeleteCategories(ids: string[]): Promise<{ deleted: number; failed: string[] }> {
        try {
            const failed: string[] = []
            let deleted = 0

            const Product = require('../models/Product').default

            for (const id of ids) {
                try {
                    if (!Types.ObjectId.isValid(id)) {
                        failed.push(`Invalid ID: ${id}`)
                        continue
                    }

                    const category = await Category.findById(id)
                    if (!category) {
                        failed.push(`Category not found: ${id}`)
                        continue
                    }

                    // Check if category has products
                    const productCount = await Product.countDocuments({ category: id })
                    if (productCount > 0) {
                        failed.push(`Category "${category.name}" has ${productCount} products`)
                        continue
                    }

                    await category.deleteOne()
                    deleted++
                } catch (error) {
                    failed.push(`Failed to delete category ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
            }

            return { deleted, failed }
        } catch (error) {
            console.error('Error bulk deleting categories:', error)
            throw new Error('Failed to bulk delete categories')
        }
    }

    // Toggle category active status
    async toggleCategoryStatus(id: string): Promise<ICategory | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid category ID')
            }

            const category = await Category.findById(id)
            if (!category) {
                throw new Error('Category not found')
            }

            category.isActive = !category.isActive
            await category.save()

            return category
        } catch (error) {
            console.error('Error toggling category status:', error)
            throw error
        }
    }

    // Get category with product count
    async getCategoryWithProductCount(id: string): Promise<{
        category: ICategory | null
        productCount: number
    }> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid category ID')
            }

            const category = await Category.findById(id).lean()
            if (!category) {
                return { category: null, productCount: 0 }
            }

            const Product = require('../models/Product').default
            const productCount = await Product.countDocuments({
                category: id,
                isPublished: true
            })

            return { category, productCount }
        } catch (error) {
            console.error('Error getting category with product count:', error)
            throw new Error('Failed to get category with product count')
        }
    }

    // Get all categories with product counts
    async getAllCategoriesWithProductCounts(): Promise<{
        _id: string
        name: string
        slug: string
        productCount: number
    }[]> {
        try {
            const categories = await Category.find({ isActive: true })
                .sort({ sortOrder: 1, name: 1 })
                .lean()

            const Product = require('../models/Product').default

            const result = await Promise.all(
                categories.map(async (category) => {
                    const productCount = await Product.countDocuments({
                        category: category._id,
                        isPublished: true
                    })
                    return {
                        _id: category._id.toString(),
                        name: category.name,
                        slug: category.slug,
                        productCount
                    }
                })
            )

            return result
        } catch (error) {
            console.error('Error getting categories with product counts:', error)
            throw new Error('Failed to get categories with product counts')
        }
    }
}

// Export singleton instance
export const categoryService = new CategoryService()