import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import React from 'react'
import { menuBarStateSelector } from './menuBarState'

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single toolbar button. Turns blue when `active` is true. */
function ToolbarButton({
  onClick,
  disabled,
  active,
  title,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  const base = 'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all border disabled:opacity-30 disabled:cursor-not-allowed'
  const inactive = 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
  const activeStyle = 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${active ? activeStyle : inactive}`}
    >
      {children}
    </button>
  )
}

/** A thin vertical line that separates button groups. */
function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />
}

/** Font size dropdown — applies inline size to selected text only. */
function FontSizeSelect({ editor }: { editor: Editor }) {
  const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px']

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const size = e.target.value
    if (size === 'reset') {
      // Remove font-size style from selected text
      editor.chain().focus().unsetFontSize().run()
    } else {
      // Apply font-size only to the selected text (inline, not block-level)
      editor.chain().focus().setFontSize(size).run()
    }

    // Reset the dropdown so it shows "Font size" again
    e.target.value = 'default'
  }

  return (
    <select
      title="Font Size"
      onChange={handleChange}
      defaultValue="default"
      className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none hover:border-gray-300 focus:border-blue-500 cursor-pointer"
    >
      <option value="default" disabled>Font size</option>
      {FONT_SIZES.map((size) => (
        <option key={size} value={size}>{size}</option>
      ))}
      <option value="reset">Reset size</option>
    </select>
  )
}

// ---------------------------------------------------------------------------
// SVG Icons (kept as constants to keep the JSX below clean and readable)
// ---------------------------------------------------------------------------
const BoldIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
)

const ItalicIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="19" y1="4" x2="10" y2="4" strokeLinecap="round" />
    <line x1="14" y1="20" x2="5" y2="20" strokeLinecap="round" />
    <line x1="15" y1="4" x2="9" y2="20" strokeLinecap="round" />
  </svg>
)

const StrikeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h-4a4 4 0 0 0-4 4v3h8V8a4 4 0 0 0-4-4zm-8 8v3a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-3H8z" />
    <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
  </svg>
)

const CodeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
  </svg>
)

const ClearMarksIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ClearNodesIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const ParagraphIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
  </svg>
)

const BulletListIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
)

const OrderedListIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6H7.5M3.75 12H7.5m-3.75 6H7.5M11.25 6h9M11.25 12h9m-9 6h9" />
  </svg>
)

const CodeBlockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
)

const BlockquoteIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 14.725c0-5.141 3.892-10.519 10-11.725l.944 2c-3.077 1.183-4.944 3.42-4.944 5.725h4v9h-10v-5zm-13 0c0-5.141 3.892-10.519 10-11.725l.944 2c-3.077 1.183-4.944 3.42-4.944 5.725h4v9h-10v-5z" />
  </svg>
)

const HorizontalRuleIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" strokeDasharray="4 4" />
  </svg>
)

const HardBreakIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
)

const UndoIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
)

const RedoIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
  </svg>
)

// ---------------------------------------------------------------------------
// MenuBar
// ---------------------------------------------------------------------------

export const MenuBar = ({ editor }: { editor: Editor | null }) => {
  // Don't render anything until the editor is ready
  if (!editor) return null

  // editorState tracks which buttons should be highlighted (active) or disabled
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  })

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">

      {/* Group 1: Inline text formatting */}
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editorState.canBold} active={editorState.isBold} title="Bold">
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editorState.canItalic} active={editorState.isItalic} title="Italic">
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editorState.canStrike} active={editorState.isStrike} title="Strikethrough">
          <StrikeIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editorState.canCode} active={editorState.isCode} title="Inline Code">
          <CodeIcon />
        </ToolbarButton>
      </div>

      <Divider />

      {/* Group 2: Clear formatting */}
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} disabled={!editorState.canClearMarks} title="Clear text styles">
          <ClearMarksIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().run()} title="Clear block format">
          <ClearNodesIcon />
        </ToolbarButton>
      </div>

      <Divider />

      {/* Group 3: Block type (paragraph / headings) — applies to the entire paragraph */}
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} active={editorState.isParagraph} title="Paragraph">
          <ParagraphIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editorState.isHeading1} title="Heading 1">
          <span className="text-xs font-bold leading-none">H1</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editorState.isHeading2} title="Heading 2">
          <span className="text-xs font-bold leading-none">H2</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editorState.isHeading3} title="Heading 3">
          <span className="text-xs font-bold leading-none">H3</span>
        </ToolbarButton>
      </div>

      <Divider />

      {/* Font size — applies only to selected text (inline), unlike headings */}
      <FontSizeSelect editor={editor} />

      <Divider />

      {/* Group 4: Lists and block elements */}
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editorState.isBulletList} title="Bullet List">
          <BulletListIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editorState.isOrderedList} title="Numbered List">
          <OrderedListIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editorState.isCodeBlock} title="Code Block">
          <CodeBlockIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editorState.isBlockquote} title="Blockquote">
          <BlockquoteIcon />
        </ToolbarButton>
      </div>

      <Divider />

      {/* Group 5: Insert elements */}
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <HorizontalRuleIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHardBreak().run()} title="Line Break">
          <HardBreakIcon />
        </ToolbarButton>
      </div>

      {/* Spacer — pushes undo/redo to the right */}
      <div className="flex-1" />

      {/* Group 6: History */}
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo} title="Undo">
          <UndoIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo} title="Redo">
          <RedoIcon />
        </ToolbarButton>
      </div>

    </div>
  )
}