'use client'

import { TextStyleKit, FontSize } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { forwardRef, useImperativeHandle } from 'react'
import { MenuBar } from './MenuBar'

// ---------------------------------------------------------------------------
// EditorHandle
// This is the "remote control" the parent gets when it uses a ref on <Editor />.
// The parent can call editorRef.current.getHTML() or getJSON() to read the content.
// ---------------------------------------------------------------------------
export interface EditorHandle {
  getHTML: () => string;
  getJSON: () => object;
}

const extensions = [
  // TextStyleKit includes TextStyle mark — required for FontSize to work
  TextStyleKit,
  // FontSize allows changing the size of selected text inline (not block-level)
  FontSize,
  StarterKit,
  Placeholder.configure({
    placeholder: 'Start writing your story.....',
  }),
]

// We wrap the component with forwardRef so the parent can pass a ref to it.
const Editor = forwardRef<EditorHandle>(function Editor(_props, ref) {
  const editor = useEditor({
    extensions,
    content: `
<h2>Hi there,</h2>
<p>This is a <em>basic</em> example of <strong>Tiptap</strong>.</p>
`,
  })

  // useImperativeHandle defines what the parent can do with the ref.
  // Here we expose a single method: getHTML()
  // So in the parent we just call: editorRef.current.getHTML()
  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() ?? '',
    getJSON: () => editor?.getJSON() ?? {},
  }))

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-200">
      <MenuBar editor={editor} />
      <div className="relative flex-1 bg-white min-h-[450px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
})

export default Editor