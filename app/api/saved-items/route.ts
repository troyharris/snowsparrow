import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { DatabaseConversation, StorageFile, SavedItem } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const search = searchParams.get('search') || ''

    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Initialize results array
    const items: SavedItem[] = []

    // Get conversations if type is 'all' or 'conversation'
    if (type === 'all' || type === 'conversation') {
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*, tool:tools(name, href)')
        .eq('user_id', userId)
        .ilike('title', `%${search}%`)
        .order('updated_at', { ascending: false })

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError)
      } else if (conversations) {
        items.push(
          ...conversations.map((conv: DatabaseConversation) => ({
            id: conv.id,
            title: conv.title,
            type: 'conversation' as const,
            created_at: conv.created_at ?? "",
            updated_at: conv.updated_at ?? "",
            preview: null, // Could add first message preview later
            tool: conv.tool?.name ?? undefined,
            tool_href: conv.tool?.href ?? undefined
          }))
        )
      }
    }

    // Get flowcharts if type is 'all' or 'flowchart'
    if (type === 'all' || type === 'flowchart') {
      const { data: flowcharts, error: flowchartsError } = await supabase
        .storage
        .from('flowcharts')
        .list(userId + '/', {
          limit: 100,
          search: search
        })

      if (flowchartsError) {
        console.error('Error fetching flowcharts:', flowchartsError)
      } else if (flowcharts) {
        const { data: urls } = await supabase
          .storage
          .from('flowcharts')
          .createSignedUrls(
            flowcharts.map((f: StorageFile) => `${userId}/${f.name}`),
            60 // URL valid for 60 seconds
          )

        items.push(
          ...flowcharts.map((file: StorageFile, index: number) => ({
            id: file.id,
            title: file.name.replace('.png', ''),
            type: 'flowchart' as const,
            created_at: file.created_at,
            updated_at: file.updated_at,
            preview: urls?.[index]?.signedUrl || null
          }))
        )
      }
    }

    // Sort all items by updated_at
    items.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error in saved-items route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id || !type) {
      return NextResponse.json(
        { error: 'Missing id or type parameter' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    if (type === 'conversation') {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting conversation:', error)
        return NextResponse.json(
          { error: 'Failed to delete conversation' },
          { status: 500 }
        )
      }
    } else if (type === 'flowchart') {
      const { error } = await supabase
        .storage
        .from('flowcharts')
        .remove([`${userId}/${id}.png`])

      if (error) {
        console.error('Error deleting flowchart:', error)
        return NextResponse.json(
          { error: 'Failed to delete flowchart' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in saved-items delete route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
