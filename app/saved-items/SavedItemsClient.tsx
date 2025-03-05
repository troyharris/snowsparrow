"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

interface SavedItem {
  id: string
  title: string
  type: 'conversation' | 'flowchart'
  created_at: string
  updated_at: string
  preview: string | null
  tool?: string
}

export default function SavedItemsClient() {
  const router = useRouter()
  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    fetchItems()
  }, [searchTerm, selectedType])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        `/api/saved-items?type=${selectedType}&search=${encodeURIComponent(searchTerm)}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch saved items')
      }
      const data = await response.json()
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, type: 'conversation' | 'flowchart') => {
    try {
      const response = await fetch(
        `/api/saved-items?id=${id}&type=${type}`,
        { method: 'DELETE' }
      )
      if (!response.ok) {
        throw new Error('Failed to delete item')
      }
      // Remove the deleted item from the state
      setItems(items.filter(item => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved Items</h1>
        <p className="text-gray-600">
          Access and manage all your saved content in one place
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search saved items..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedType}
          onChange={handleTypeChange}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="flowchart">Flowcharts</option>
          <option value="conversation">Conversations</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <div className="p-4">
            <p className="text-gray-500 text-sm">No saved items found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <Card key={item.id}>
              <div 
                className={`p-4 ${item.type === 'conversation' ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => {
                  if (item.type === 'conversation' && item.tool) {
                    router.push(`/${item.tool}?id=${item.id}`)
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent card click when deleting
                      handleDelete(item.id, item.type)
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-gray-500">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  <span className="text-sm text-gray-400 mx-2">•</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(item.updated_at)}
                  </span>
                </div>
                {item.type === 'flowchart' && item.preview && (
                  <div className="mt-2">
                    <img
                      src={item.preview}
                      alt={item.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
