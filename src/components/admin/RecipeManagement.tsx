"use client"

import React, { useState, useEffect } from 'react'
import { GlassCard, GlassButton, GlassModal, GlassInput } from '@/components/ui/glass'
import { 
  ChefHat, 
  Plus, 
  Edit2, 
  RefreshCw,
  Search,
  Play,
  AlertTriangle,
  Clock,
  DollarSign,
  Package
} from 'lucide-react'

interface InventoryItem {
  _id: string
  name: string
  unit: string
  currentStock: number
  averageCostPerUnit: number
}

interface Recipe {
  _id: string
  recipeid: string
  name: string
  description?: string
  type: string
  servingSize: number
  estimatedCost: number
  costPerServing: number
  preparationTime?: number
  difficulty: string
  ingredients: {
    item: InventoryItem
    quantity: number
    unit: string
    notes?: string
  }[]
  instructions: string[]
  tags: string[]
  status: string
  usageCount: number
  lastUsed?: string
  createdAt: string
}

interface RecipeFormData {
  recipeid: string
  name: string
  description: string
  type: string
  servingSize: string
  preparationTime: string
  difficulty: string
  instructions: string[]
  tags: string
}

const RecipeManagement: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showUseModal, setShowUseModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const [formData, setFormData] = useState<RecipeFormData>({
    recipeid: '',
    name: '',
    description: '',
    type: 'menu_item',
    servingSize: '1',
    preparationTime: '',
    difficulty: 'medium',
    instructions: [''],
    tags: ''
  })

  const [ingredients, setIngredients] = useState<{item: string, quantity: string, unit: string, notes: string}[]>([
    { item: '', quantity: '', unit: '', notes: '' }
  ])

  const [useQuantity, setUseQuantity] = useState('1')
  const [useReference, setUseReference] = useState('')
  const [useNotes, setUseNotes] = useState('')
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchRecipes()
    fetchItems()
  }, [])

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        return
      }

      let url = '/api/inventory/recipes'
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterType !== 'all') params.append('type', filterType)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRecipes(data.recipes)
        }
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.error('No admin token found')
        return
      }
      
      const response = await fetch('/api/inventory/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setItems(data.items)
        }
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const token = localStorage.getItem('adminToken')
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')
      
      if (!token) {
        console.error('No admin token found')
        return
      }

      const payload = {
        ...formData,
        servingSize: parseInt(formData.servingSize),
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        ingredients: ingredients.filter(ing => ing.item && ing.quantity).map(ing => ({
          item: ing.item,
          quantity: parseFloat(ing.quantity),
          unit: ing.unit,
          notes: ing.notes
        })),
        createdBy: adminData.adminid || 'admin'
      }

      const url = '/api/inventory/recipes'
      const method = editingRecipe ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        setShowModal(false)
        setEditingRecipe(null)
        resetForm()
        fetchRecipes()
      } else {
        if (result.details) {
          const errorObj: {[key: string]: string} = {}
          result.details.forEach((detail: any) => {
            if (detail.path) {
              errorObj[detail.path[0]] = detail.message
            }
          })
          setErrors(errorObj)
        }
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
    }
  }

  const handleUseRecipe = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('adminToken')
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')
      
      if (!token || !selectedRecipe) {
        return
      }

      const payload = {
        action: 'use',
        recipeid: selectedRecipe.recipeid,
        quantity: parseInt(useQuantity),
        reference: useReference,
        notes: useNotes,
        performedBy: adminData.adminid || 'admin'
      }

      const response = await fetch('/api/inventory/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        setShowUseModal(false)
        setSelectedRecipe(null)
        setUseQuantity('1')
        setUseReference('')
        setUseNotes('')
        fetchRecipes()
        alert('Recipe used successfully! Stock has been updated.')
      } else {
        alert(result.message || 'Failed to use recipe')
      }
    } catch (error) {
      console.error('Error using recipe:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      recipeid: '',
      name: '',
      description: '',
      type: 'menu_item',
      servingSize: '1',
      preparationTime: '',
      difficulty: 'medium',
      instructions: [''],
      tags: ''
    })
    setIngredients([{ item: '', quantity: '', unit: '', notes: '' }])
    setErrors({})
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', quantity: '', unit: '', notes: '' }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ''] })
  }

  const removeInstruction = (index: number) => {
    setFormData({ 
      ...formData, 
      instructions: formData.instructions.filter((_, i) => i !== index) 
    })
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = [...formData.instructions]
    updated[index] = value
    setFormData({ ...formData, instructions: updated })
  }

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setFormData({
      recipeid: recipe.recipeid,
      name: recipe.name,
      description: recipe.description || '',
      type: recipe.type,
      servingSize: recipe.servingSize.toString(),
      preparationTime: recipe.preparationTime?.toString() || '',
      difficulty: recipe.difficulty,
      instructions: recipe.instructions.length > 0 ? recipe.instructions : [''],
      tags: recipe.tags.join(', ')
    })
    setIngredients(recipe.ingredients.map(ing => ({
      item: ing.item._id,
      quantity: ing.quantity.toString(),
      unit: ing.unit,
      notes: ing.notes || ''
    })))
    setShowModal(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { bg: 'bg-green-100', text: 'text-green-700' }
      case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-700' }
      case 'hard': return { bg: 'bg-red-100', text: 'text-red-700' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ChefHat className="w-7 h-7 sm:w-8 sm:h-8" />
            Recipe Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage recipes with ingredient tracking</p>
        </div>
        <GlassButton
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recipe</span>
        </GlassButton>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="menu_item">Menu Items</option>
              <option value="preparation">Preparation</option>
              <option value="cleaning">Cleaning</option>
              <option value="other">Other</option>
            </select>
            <GlassButton 
              onClick={fetchRecipes}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Recipes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </GlassCard>
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recipes.map((recipe) => {
            const diffColors = getDifficultyColor(recipe.difficulty)
            return (
              <GlassCard key={recipe._id} className="p-4 sm:p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{recipe.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm capitalize mt-1">
                      {recipe.type.replace('_', ' ')}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 ml-2 px-3 py-1 rounded-full text-xs font-semibold ${diffColors.bg} ${diffColors.text}`}>
                    {recipe.difficulty}
                  </span>
                </div>

                {recipe.description && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{recipe.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
                  <div className="flex items-center text-gray-700 bg-gray-50 p-2 rounded">
                    <ChefHat className="w-4 h-4 mr-1 text-blue-600 flex-shrink-0" />
                    <span>{recipe.servingSize} serving{recipe.servingSize > 1 ? 's' : ''}</span>
                  </div>
                  {recipe.preparationTime && (
                    <div className="flex items-center text-gray-700 bg-gray-50 p-2 rounded">
                      <Clock className="w-4 h-4 mr-1 text-green-600 flex-shrink-0" />
                      <span>{recipe.preparationTime} min</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700 bg-gray-50 p-2 rounded">
                    <DollarSign className="w-4 h-4 mr-1 text-orange-600 flex-shrink-0" />
                    <span className="truncate">{formatCurrency(recipe.costPerServing)}</span>
                  </div>
                  <div className="flex items-center text-gray-700 bg-gray-50 p-2 rounded">
                    <Play className="w-4 h-4 mr-1 text-purple-600 flex-shrink-0" />
                    <span>{recipe.usageCount}× used</span>
                  </div>
                </div>

                {recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {recipe.tags.length > 2 && (
                      <span className="text-xs text-gray-600">+{recipe.tags.length - 2}</span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  <GlassButton
                    onClick={() => {
                      setSelectedRecipe(recipe)
                      setShowUseModal(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 font-semibold px-3 py-2 text-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span className="hidden sm:inline">Use Recipe</span>
                    <span className="sm:hidden">Use</span>
                  </GlassButton>
                  <GlassButton
                    onClick={() => openEditModal(recipe)}
                    className="px-3 py-2 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </GlassButton>
                </div>
              </GlassCard>
            )
          })}
        </div>
      ) : (
        <GlassCard className="p-12 text-center">
          <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-1 sm:mb-2">No recipes found</h3>
          <p className="text-gray-600 text-sm mb-4">Start by creating your first recipe</p>
          <GlassButton
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="mx-auto flex items-center justify-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recipe</span>
          </GlassButton>
        </GlassCard>
      )}

      {/* Recipe Modal */}
      {showModal && (
        <GlassModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingRecipe(null)
            resetForm()
          }}
          title={editingRecipe ? "Edit Recipe" : "Add New Recipe"}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe ID *
                </label>
                <input
                  type="text"
                  value={formData.recipeid}
                  onChange={(e) => setFormData({...formData, recipeid: e.target.value})}
                  placeholder="Enter recipe ID"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.recipeid && <p className="text-red-600 text-xs mt-1">{errors.recipeid}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter recipe name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="menu_item">Menu Item</option>
                  <option value="preparation">Preparation</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serving Size *
                </label>
                <input
                  type="number"
                  value={formData.servingSize}
                  onChange={(e) => setFormData({...formData, servingSize: e.target.value})}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({...formData, preparationTime: e.target.value})}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Ingredients */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-800">Ingredients</h3>
                <GlassButton
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 font-semibold px-3 py-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </GlassButton>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Item</label>
                      <select
                        value={ingredient.item}
                        onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                        required
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select item</option>
                        {items.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                      <input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                      <input
                        type="text"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        placeholder="kg, pcs"
                        required
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                      <input
                        type="text"
                        value={ingredient.notes}
                        onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                        placeholder="Optional"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <GlassButton
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="w-full px-2 py-1.5 text-red-600 hover:bg-red-50 text-sm"
                        disabled={ingredients.length === 1}
                      >
                        Remove
                      </GlassButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-800">Instructions</h3>
                <GlassButton
                  type="button"
                  onClick={addInstruction}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold px-3 py-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Step</span>
                </GlassButton>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <span className="text-gray-600 text-xs font-semibold mt-2 min-w-fit">
                      {index + 1}.
                    </span>
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      rows={2}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <GlassButton
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="px-2 py-1.5 text-red-600 hover:bg-red-50 text-sm mt-1"
                      disabled={formData.instructions.length === 1}
                    >
                      Remove
                    </GlassButton>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="e.g., spicy, vegetarian, quick"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <GlassButton
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setEditingRecipe(null)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700"
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold"
              >
                {editingRecipe ? 'Update' : 'Create'} Recipe
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}

      {/* Use Recipe Modal */}
      {showUseModal && selectedRecipe && (
        <GlassModal
          isOpen={showUseModal}
          onClose={() => {
            setShowUseModal(false)
            setSelectedRecipe(null)
            setUseQuantity('1')
            setUseReference('')
            setUseNotes('')
          }}
          title={`Use Recipe: ${selectedRecipe.name}`}
        >
          <form onSubmit={handleUseRecipe} className="space-y-5">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="text-gray-900 font-semibold mb-3">Recipe Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center">
                  <ChefHat className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Serving: {selectedRecipe.servingSize}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                  <span>Cost: {formatCurrency(selectedRecipe.costPerServing)}</span>
                </div>
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-2 text-orange-600" />
                  <span>{selectedRecipe.ingredients.length} ingredients</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-purple-600" />
                  <span>{selectedRecipe.preparationTime || 'N/A'} min</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (servings) *
              </label>
              <input
                type="number"
                value={useQuantity}
                onChange={(e) => setUseQuantity(e.target.value)}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference (Order #, Event, etc.)
              </label>
              <input
                type="text"
                value={useReference}
                onChange={(e) => setUseReference(e.target.value)}
                placeholder="Optional reference"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={useNotes}
                onChange={(e) => setUseNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center text-orange-700 mb-2 font-semibold">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Stock Impact
              </div>
              <p className="text-sm text-orange-700">
                Using this recipe will deduct ingredients from your current stock. 
                <br />
                <span className="font-semibold">Total cost: {formatCurrency(selectedRecipe.costPerServing * parseInt(useQuantity || '1'))}</span>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <GlassButton
                type="button"
                onClick={() => {
                  setShowUseModal(false)
                  setSelectedRecipe(null)
                  setUseQuantity('1')
                  setUseReference('')
                  setUseNotes('')
                }}
                className="px-4 py-2 text-gray-700"
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 font-semibold"
              >
                Use Recipe
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}
    </div>
  )
}

export default RecipeManagement