"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Layers, Home, Upload, Download, Plus, AlignVerticalSpaceBetween, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { renderDesignComponent } from "@/components/page-builder/page-builder"
import { PageCraftToolbar } from "@/components/page-builder/pagecraft-toolbar"
import { useAppState, usePageOperations, useComponentOperations, useHistoryOperations } from "@/lib/store/hooks"
import type { ComponentWrapperProps, PageBuilderMode } from "@/features/design-components/types"

export default function BuilderPage() {
  const { state, dispatch } = useAppState()
  const pageBuilderMode = (state.previewMode ? "preview" : "edit") as PageBuilderMode
  const { savePageAsJsonMutation, loadPageMutation, savePageAsHtmlMutation, savePageAsShortcodeMutation } = usePageOperations()
  const { addComponent, updateComponent, removeComponent, duplicateComponent, replaceComponent } =
    useComponentOperations(dispatch, state)
  const { handleSelectHistory, handleHistoryAccept, handleHistoryDiscard, handleDiscard } = useHistoryOperations(
    dispatch,
    state,
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saveDropdownOpen, setSaveDropdownOpen] = useState(false)

  // Get the current active page
  const currentPage = state.pages.find((page) => page.id === state.activePage) || state.pages[0]

  const saveAsJSON = () => {
    savePageAsJsonMutation.mutate(currentPage)
    setSaveDropdownOpen(false)
  }

  const saveAsShortcode = () => {
    savePageAsShortcodeMutation.mutate(currentPage)
    setSaveDropdownOpen(false)
  }

  const saveAsHTML = () => {
    savePageAsHtmlMutation.mutate(currentPage)
    setSaveDropdownOpen(false)
  }

  // Load a page from a file
  const loadPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    loadPageMutation.mutate(file, {
      onSuccess: (loadedPage) => {
        // Check if the page already exists
        const existingPageIndex = state.pages.findIndex((p) => p.id === loadedPage.id)

        if (existingPageIndex >= 0) {
          // Update existing page
          dispatch({
            type: "UPDATE_PAGE",
            payload: { id: loadedPage.id, updates: loadedPage },
          })
        } else {
          // Add as a new page
          dispatch({ type: "ADD_PAGE", payload: loadedPage })
        }

        dispatch({ type: "SET_ACTIVE_PAGE", payload: loadedPage.id })

        // Add to history
        setTimeout(() => {
          dispatch({
            type: "ADD_TO_HISTORY",
            payload: {
              action: "Loaded page",
              pageState: state.pages,
            },
          })
        }, 0)
      },
    })

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function setSelectedComponent(componentId: string): void {
    if (pageBuilderMode === "edit") {
      dispatch({ type: "SET_SELECTED_COMPONENT", payload: componentId })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b px-2">
        <div className="container flex items-center justify-between py-4 mx-auto">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">PageCraft</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => dispatch({ type: "SET_PREVIEW_MODE", payload: pageBuilderMode === "edit" })}
            >
              {pageBuilderMode === "edit" ? "Switch to Preview Mode" : "Switch to Edit Mode"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="container py-4 border-b mx-auto">
          <div className="flex justify-between items-center">
            <Input
              defaultValue={currentPage.title}
              onChange={(e) => {
                dispatch({
                  type: "UPDATE_PAGE",
                  payload: { id: state.activePage, updates: { title: e.target.value } },
                })
              }}
              className="text-xl font-semibold w-auto max-w-xs"
              id="page-title"
              placeholder="Page Title"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Load
              </Button>
              <input type="file" ref={fileInputRef} onChange={loadPage} accept=".json" className="hidden" />

              <DropdownMenu open={saveDropdownOpen} onOpenChange={setSaveDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Save
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={saveAsShortcode} disabled={savePageAsShortcodeMutation.isPending}>
                    <Download className="h-4 w-4 mr-2" />
                    {savePageAsShortcodeMutation.isPending ? "Exporting..." : "Download as Shortcode"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={saveAsJSON} disabled={savePageAsJsonMutation.isPending}>
                    <Download className="h-4 w-4 mr-2" />
                    {savePageAsJsonMutation.isPending ? "Saving..." : "Download as JSON"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={saveAsHTML} disabled={savePageAsHtmlMutation.isPending}>
                    <Download className="h-4 w-4 mr-2" />
                    {savePageAsHtmlMutation.isPending ? "Exporting..." : "Download as HTML"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <div
            className="bg-white min-h-[800px] max-w-5xl mx-auto shadow-sm border rounded-md p-8"
            onClick={() => setSelectedComponent("")}
          >
            {currentPage.components.map((component) => (
              <React.Fragment key={component.id}>
                {renderDesignComponent({
                  pageBuilderMode,
                  component,
                  selectedComponentId: state.selectedComponentId,
                  setSelectedComponent: setSelectedComponent,
                  updateComponent,
                  removeComponent,
                  addComponent,
                  duplicateComponent,
                  replaceComponent,
                } as ComponentWrapperProps<typeof component.tag>)}
              </React.Fragment>
            ))}

            {pageBuilderMode === "edit" && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-md p-4">
                <Button
                  variant="outline"
                  className="gap-2 px-4 py-2"
                  onClick={() =>
                    addComponent({ type: "row", parentId: undefined, index: currentPage.components.length })
                  }
                >
                  <AlignVerticalSpaceBetween className="h-5 w-5" />
                  <span>Add Row</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <PageCraftToolbar
        toolbarMinimized={state.toolbarMinimized}
        setToolbarMinimized={(minimized) => dispatch({ type: "SET_TOOLBAR_MINIMIZED", payload: minimized })}
        savePage={saveAsJSON}
        handleDiscard={handleDiscard}
        pageBuilderMode={pageBuilderMode}
        history={state.history}
        currentHistoryIndex={state.currentHistoryIndex}
        onSelectHistory={handleSelectHistory}
        onAcceptHistory={handleHistoryAccept}
        onDiscardHistory={handleHistoryDiscard}
        historyPreviewIndex={state.historyPreviewIndex}
      />

      {!state.showToolbar && pageBuilderMode === "edit" && (
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50"
          onClick={() => dispatch({ type: "SET_SHOW_TOOLBAR", payload: true })}
        >
          <Plus className="h-4 w-4 mr-2" /> Components
        </Button>
      )}
    </div>
  )
}
