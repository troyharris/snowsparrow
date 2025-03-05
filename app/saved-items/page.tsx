import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import SavedItemsClient from './SavedItemsClient'

export const metadata = {
  title: 'Saved Items - Snowsparrow',
  description: 'Access and manage all your saved content in one place'
}

export default function SavedItemsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SavedItemsClient />
    </Suspense>
  )
}
