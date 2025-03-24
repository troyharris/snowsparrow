export interface UploadRequest {
    imageData: string; // base64 PNG data
    prompt: string; // original prompt
    mermaidCode: string; // generated mermaid code
  }

  export interface StorageFile {
    id: string
    name: string
    created_at: string
    updated_at: string
  }

  export interface SavedItem {
    id: string
    title: string
    type: 'conversation' | 'flowchart'
    created_at: string
    updated_at: string
    preview: string | null
    tool?: string
    tool_href?: string 
}
