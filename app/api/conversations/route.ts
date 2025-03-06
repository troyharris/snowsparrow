import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ConversationMessage } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    
    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    
    // Get the messages
    const { data: messages, error: messagesError } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("message_order", { ascending: true });
    
    if (messagesError) {
      return NextResponse.json(
        { error: "Failed to fetch conversation messages" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      conversation,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, messages, toolId, modelId, promptId } = await request.json();
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify tool exists
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id")
      .eq("id", toolId)
      .single();

    if (toolError || !tool) {
      return NextResponse.json(
        { error: "Invalid tool ID" },
        { status: 400 }
      );
    }
    
    // Create the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: title || "Untitled Conversation",
        tool_id: toolId,
        model_id: modelId || null,
        prompt_id: promptId || null
      })
      .select()
      .single();
    
    if (conversationError) {
      console.error("Error saving conversation:", conversationError);
      return NextResponse.json(
        { error: "Failed to save conversation" },
        { status: 500 }
      );
    }
    
    // Save all messages with order
    const messagesToInsert = messages.map((msg: ConversationMessage, index: number) => ({
      conversation_id: conversation.id,
      role: msg.role,
      content: msg.content,
      message_order: index
    }));
    
    const { error: messagesError } = await supabase
      .from("conversation_messages")
      .insert(messagesToInsert);
    
    if (messagesError) {
      console.error("Error saving messages:", messagesError);
      // If messages fail to save, delete the conversation to avoid orphaned records
      await supabase.from("conversations").delete().eq("id", conversation.id);
      
      return NextResponse.json(
        { error: "Failed to save conversation messages" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      conversation: conversation 
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
}
