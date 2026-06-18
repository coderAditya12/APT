"use client";

import Editor, { type EditorHandle } from "@/components/editor/Editor";
import Link from "next/link";
import React, { useRef, useState } from "react";

const CreateBlogPage = () => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");

  // editorRef gives us a direct reference to the Editor component.
  // We can call editorRef.current.getHTML() to read the content at any time.
  const editorRef = useRef<EditorHandle>(null);

  const handlePublish = () => {
    // Read all the data only when the user clicks Publish.
    // editorRef.current.getJSON() returns the editor content as a JSON object.
    const postData = {
      title,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      content: editorRef.current?.getJSON() ?? {},
    };

    console.log("Blog Post JSON:", postData);
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#1b1f24]">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-20 border-b border-[#d8dde5] bg-white px-5 py-4 shadow-sm backdrop-blur-md bg-white/95 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8dde5] bg-white text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title="Back to Dashboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#687386]">
                <Link href="/home" className="hover:underline">Dashboard</Link>
                <span>/</span>
                <span className="text-gray-400">New Post</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Create Blog Post</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePublish}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#2563eb] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* Editor Content Area */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Writing Area */}
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-[#d8dde5] bg-white p-6 shadow-sm sm:p-8">
              {/* Blog Title Field */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Enter your post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-b border-transparent pb-3 text-3xl font-bold text-gray-900 placeholder-gray-300 outline-none transition-all focus:border-gray-200"
                />
              </div>

              {/* Tiptap Rich Text Editor */}
              {/* We pass editorRef here so we can call editorRef.current.getHTML() on Publish */}
              <Editor ref={editorRef} />
            </div>
          </section>

          {/* Sidebar / Settings Area */}
          <aside className="space-y-6">
            {/* Meta & Categories Card */}
            <div className="rounded-xl border border-[#d8dde5] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Post Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. nextjs, tailwind, ui"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Featured Image Card */}
            <div className="rounded-xl border border-[#d8dde5] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Featured Image</h2>
              <div className="group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-500 transition-colors bg-gray-50">
                <svg
                  className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-500 transition-colors">Upload cover image</span>
                <span className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB</span>
              </div>
            </div>

            {/* Google Search SEO Preview */}
            <div className="rounded-xl border border-[#d8dde5] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">SEO Preview</h2>
              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 block font-normal leading-none">www.blogadmin.com/posts/{title ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "untitled-post"}</span>
                <h3 className="text-lg text-blue-800 font-semibold leading-snug hover:underline cursor-pointer">{title || "Untitled Post | Blog Admin"}</h3>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  Start writing your story in the editor. Add a meta description or let the editor generate it automatically to boost search engine visibility.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CreateBlogPage;