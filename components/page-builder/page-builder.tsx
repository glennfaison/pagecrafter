"use client"

import { Button } from "@/components/ui/button"
import { Settings, Trash2, Move, Copy, Plus, Replace } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"
import type {
  ComponentTag,
  DesignComponent,
  ComponentAttributes,
  ComponentWrapperProps,
  ComponentControlsProps,
} from "@/features/design-components/types"
import { componentTagList, createDesignComponent, getComponentInfo } from "@/features/design-components"
import type { ReactNode } from "react"
import { generateId, intersperseAndAppend } from "@/lib/utils"
import { SettingsPopover } from "./settings-popover"
import { ComponentSelectorPopover } from "./component-selector-popover"
import { withConnection } from "./connected-component-hoc"

// Divider component for adding elements between existing ones
const Divider = ({
  orientation,
  onAddComponent,
  index,
  isVisible,
}: {
  orientation: "horizontal" | "vertical"
  onAddComponent: (type: ComponentTag, index: number) => void
  index: number
  isVisible: boolean
}) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  isVisible = isVisible || popoverOpen

  const handleAddComponent = (type: ComponentTag) => {
    onAddComponent(type, index)
    setPopoverOpen(false)
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-all duration-200 group",
        "cursor-pointer bg-transparent hover:bg-gray-400 hover:visible",
        isVisible ? "bg-gray-400" : "invisible",
        orientation === "horizontal" ? "flex-row h-px w-full hover:h-2" : "flex-col w-px hover:w-2",
        isVisible && (orientation === "horizontal" ? "h-1" : "w-1"),
      )}
    >
      <ComponentSelectorPopover onSelect={handleAddComponent} componentTagList={componentTagList}>
        <Button
          variant="ghost"
          size="icon"
          className={cn("absolute bg-background border shadow-sm transition-opacity z-20 h-6 w-6 rounded-full")}
          onClick={(e) => {
            e.stopPropagation()
            setPopoverOpen(true)
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </ComponentSelectorPopover>
    </div>
  )
}

// Replace With Popover
export const ReplaceWithPopover = ({
  children,
  currentComponent,
  onReplace,
}: {
  children: React.ReactNode
  currentComponent: DesignComponent<ComponentTag>
  onReplace: (newType: ComponentTag) => void
}) => {
  const tagList = componentTagList.filter((tag) => tag !== currentComponent.tag)

  const handleReplace = (newType: ComponentTag) => {
    onReplace(newType)
  }

  return (
    <ComponentSelectorPopover
      componentTagList={tagList}
      onSelect={handleReplace}
    >
      {children}
    </ComponentSelectorPopover>
  )
}

//#region Wrapper Components

function ComponentControls<Tag extends ComponentTag>({
  component,
  updateComponent,
  duplicateComponent,
  removeComponent,
  replaceComponent,
}: ComponentControlsProps<Tag>) {
  const { label } = getComponentInfo(component.tag)

  const handleReplace = (newType: ComponentTag) => {
    replaceComponent(component.id, newType);
  }

  return (
    <div className="absolute -top-8 right-0 flex gap-1 bg-background border rounded-t-md p-1 shadow-sm">
      <span className="text-xs font-medium px-2 flex items-center">{label}</span>
      <SettingsPopover
        component={component}
        onSave={(props) => updateComponent(component.id, props as ComponentAttributes<Tag>)}
      >
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
          <Settings className="h-4 w-4" />
        </Button>
      </SettingsPopover>
      <ReplaceWithPopover currentComponent={component} onReplace={handleReplace}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
          <Replace className="h-4 w-4" />
        </Button>
      </ReplaceWithPopover>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          duplicateComponent?.(component.id)
        }}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          removeComponent(component.id)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 cursor-move">
        <Move className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Generic Design Component Wrapper
export const GenericDesignComponentWrapper = ({
  pageBuilderMode,
  component,
  selectedComponentId,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
  replaceComponent,
}: ComponentWrapperProps<Exclude<ComponentTag, "row" | "column">>) => {
  const componentType = component.tag
  const showControls = selectedComponentId === component.id
  const componentProps = {
    className: cn(
      "relative border border-transparent transition-all",
      showControls && "border-primary",
      "hover:border-gray-300",
    ),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedComponent(component.id)
    },
  }

  const componentControls =
    selectedComponentId === component.id &&
    ComponentControls({
      component,
      updateComponent,
      duplicateComponent,
      removeComponent,
      replaceComponent,
    })

  const componentData = React.useMemo(() => getComponentInfo(componentType), [componentType])
  const Component = withConnection(componentData.Component)

  return (
    <div {...componentProps}>
      {componentControls}
      {Component({
        pageBuilderMode,
        componentId: component.id,
        attributes: component.attributes,
        setSelectedComponent,
        updateComponent,
        removeComponent,
        addComponent,
        duplicateComponent,
        replaceComponent,
      })}
    </div>
  )
}

const useDividerVisibility = () => {
  const [visibleVerticalDividers, setVisibleVerticalDividers] = React.useState<Set<number>>(new Set())
  const [visibleHorizontalDividers, setVisibleHorizontalDividers] = React.useState<Set<number>>(new Set())
  const hideTimeoutRef = React.useRef<Record<string, NodeJS.Timeout>>({})
  const visibilityTimeoutMS = 300

  const showVerticalDivider = (index: number) => {
    if (hideTimeoutRef.current[`v${index}`]) {
      clearTimeout(hideTimeoutRef.current[`v${index}`])
      delete hideTimeoutRef.current[`v${index}`]
    }
    setVisibleVerticalDividers((prev) => new Set(prev).add(index))
  }

  const showHorizontalDivider = (index: number) => {
    if (hideTimeoutRef.current[`h${index}`]) {
      clearTimeout(hideTimeoutRef.current[`h${index}`])
      delete hideTimeoutRef.current[`h${index}`]
    }
    setVisibleHorizontalDividers((prev) => new Set(prev).add(index))
  }

  const hideVerticalDivider = (index: number) => {
    hideTimeoutRef.current[`v${index}`] = setTimeout(() => {
      setVisibleVerticalDividers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, visibilityTimeoutMS)
  }

  const hideHorizontalDivider = (index: number) => {
    hideTimeoutRef.current[`h${index}`] = setTimeout(() => {
      setVisibleHorizontalDividers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, visibilityTimeoutMS)
  }

  const handleChildMouseMove = (e: React.MouseEvent, childIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const y = e.clientY - rect.top
    const height = rect.height

    if (x < width * 0.3) {
      const leftDividerIndex = childIndex * 2
      showVerticalDivider(leftDividerIndex)
    } else if (x > width * 0.7) {
      const rightDividerIndex = (childIndex + 1) * 2
      showVerticalDivider(rightDividerIndex)
    }

    if (y < height * 0.3) {
      const topDividerIndex = childIndex * 2
      showHorizontalDivider(topDividerIndex)
    } else if (y > height * 0.7) {
      const bottomDividerIndex = (childIndex + 1) * 2
      showHorizontalDivider(bottomDividerIndex)
    }
  }

  const handleChildMouseLeave = (childIndex: number) => {
    const leftDividerIndex = 2 * childIndex
    const rightDividerIndex = 2 * childIndex + 2
    const topDividerIndex = 2 * childIndex
    const bottomDividerIndex = 2 * childIndex + 2
    hideVerticalDivider(leftDividerIndex)
    hideVerticalDivider(rightDividerIndex)
    hideHorizontalDivider(topDividerIndex)
    hideHorizontalDivider(bottomDividerIndex)
  }

  return {
    visibleVerticalDividers,
    visibleHorizontalDividers,
    handleChildMouseMove,
    handleChildMouseLeave,
  }
}

// Row Wrapper Component
export const RowWrapper = ({
  component,
  selectedComponentId,
  pageBuilderMode,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
  replaceComponent,
}: ComponentWrapperProps<"row">) => {
  const {
    visibleVerticalDividers: visibleDividers,
    handleChildMouseMove,
    handleChildMouseLeave,
  } = useDividerVisibility()
  const showControls = selectedComponentId === component.id

  const componentProps = {
    className: cn(
      "relative border border-transparent transition-all group",
      showControls && "border-primary",
      "hover:border-gray-300",
    ),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedComponent(component.id)
    },
  }

  const componentControls =
    showControls &&
    ComponentControls({
      component,
      updateComponent,
      duplicateComponent,
      removeComponent,
      replaceComponent,
    })

  // Handle adding component at specific index
  const handleAddAtIndex = (type: ComponentTag, dividerIndex: number) => {
    const childIndex = Math.floor(dividerIndex / 2)
    const newComponent = createDesignComponent(type, generateId())
    addComponent({ type: newComponent.tag, parentId: component.id, index: childIndex })
  }

  const hasChildren = !!component.children.length
  const componentData = getComponentInfo(component.tag)
  const RowComponent = componentData.Component

  const children = component.children.map(
    <Tag extends ComponentTag>(child: DesignComponent<Tag>, childIndex: number) => (
      <div
        key={child.id}
        className="flex-1 relative"
        onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
        onMouseLeave={() => handleChildMouseLeave(childIndex)}
      >
        {renderDesignComponent({
          component: child,
          selectedComponentId,
          pageBuilderMode,
          setSelectedComponent,
          updateComponent,
          removeComponent,
          addComponent,
          duplicateComponent,
          replaceComponent,
        })}
      </div>
    ),
  )

  return (
    <div {...componentProps}>
      {componentControls}

      <RowComponent
        pageBuilderMode={pageBuilderMode}
        componentId={component.id}
        attributes={component.attributes}
        setSelectedComponent={setSelectedComponent}
        updateComponent={updateComponent}
        removeComponent={removeComponent}
        addComponent={addComponent}
        duplicateComponent={duplicateComponent}
        replaceComponent={replaceComponent}
      >
        {hasChildren ? (
          intersperseAndAppend(children, null).map((item, index) =>
            item === null ? (
              <Divider
                key={`divider-${index}`}
                orientation="vertical"
                onAddComponent={handleAddAtIndex}
                index={index}
                isVisible={visibleDividers.has(index)}
              />
            ) : (
              <React.Fragment key={index}>{item}</React.Fragment>
            ),
          )
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground flex-1">
            <ComponentSelectorPopover onSelect={(type) => addComponent({ type, parentId: component.id, index: 0 })} componentTagList={componentTagList}>
              <Button variant="outline" size="icon" className="rounded-full h-6 w-6">
                <Plus className="h-3 w-3" />
                <span className="sr-only">Add component</span>
              </Button>
            </ComponentSelectorPopover>
          </div>
        )}
      </RowComponent>
    </div>
  )
}

// Column Wrapper Component
export const ColumnWrapper = ({
  component,
  selectedComponentId,
  pageBuilderMode,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
  replaceComponent,
}: ComponentWrapperProps<"column">) => {
  const {
    visibleHorizontalDividers: visibleDividers,
    handleChildMouseMove,
    handleChildMouseLeave,
  } = useDividerVisibility()
  const showControls = selectedComponentId === component.id

  const componentProps = {
    className: cn(
      "relative border border-transparent transition-all",
      showControls && "border-primary",
      "hover:border-gray-300",
    ),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedComponent(component.id)
    },
  }

  const componentControls =
    showControls &&
    ComponentControls({
      component,
      updateComponent,
      duplicateComponent,
      removeComponent,
      replaceComponent,
    })

  // Handle adding component at specific index
  const handleAddAtIndex = (type: ComponentTag, dividerIndex: number) => {
    const childIndex = Math.floor(dividerIndex / 2)
    const newComponent = createDesignComponent(type, generateId())
    addComponent({ type: newComponent.tag, parentId: component.id, index: childIndex })
  }

  const hasChildren = !!component.children.length

  const componentData = getComponentInfo(component.tag)
  const ColumnComponent = componentData.Component

  const children = React.useMemo(
    () =>
      component.children.map(
        <Tag extends ComponentTag>(child: DesignComponent<Tag>, childIndex: number) => (
          <div
            key={child.id}
            className="relative"
            onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
            onMouseLeave={() => handleChildMouseLeave(childIndex)}
          >
            {renderDesignComponent({
              component: child,
              selectedComponentId,
              pageBuilderMode,
              setSelectedComponent,
              updateComponent,
              removeComponent,
              addComponent,
              duplicateComponent,
              replaceComponent,
            })}
          </div>
        ),
      ),
    [
      component.children,
      selectedComponentId,
      pageBuilderMode,
      setSelectedComponent,
      updateComponent,
      removeComponent,
      addComponent,
      duplicateComponent,
      replaceComponent,
      handleChildMouseMove,
      handleChildMouseLeave,
    ],
  )
  return (
    <div {...componentProps}>
      {componentControls}

      <ColumnComponent
        pageBuilderMode={pageBuilderMode}
        componentId={component.id}
        attributes={component.attributes}
        setSelectedComponent={setSelectedComponent}
        updateComponent={updateComponent}
        removeComponent={removeComponent}
        addComponent={addComponent}
        duplicateComponent={duplicateComponent}
        replaceComponent={replaceComponent}
      >
        {hasChildren ? (
          intersperseAndAppend(children, null).map((item, index) =>
            item === null ? (
              <Divider
                key={`divider-${index}`}
                orientation="horizontal"
                onAddComponent={handleAddAtIndex}
                index={index}
                isVisible={visibleDividers.has(index)}
              />
            ) : (
              <React.Fragment key={index}>{item}</React.Fragment>
            ),
          )
        ) : (
          <div className="flex items-center justify-center h-full w-full text-muted-foreground">
            <ComponentSelectorPopover onSelect={(type) => addComponent({ type, parentId: component.id, index: 0 })} componentTagList={componentTagList}>
              <Button variant="outline" size="icon" className="rounded-full h-6 w-6">
                <Plus className="h-3 w-3" />
                <span className="sr-only">Add component</span>
              </Button>
            </ComponentSelectorPopover>
          </div>
        )}
      </ColumnComponent>
    </div>
  )
}

//#endregion

export function getWrapperComponent<Tag extends ComponentTag>(tag: Tag): React.FC<ComponentWrapperProps<Tag>> {
  switch (tag) {
    case "row":
      return RowWrapper as unknown as React.FC<ComponentWrapperProps<Tag>>
    case "column":
      return ColumnWrapper as unknown as React.FC<ComponentWrapperProps<Tag>>
    default:
      return GenericDesignComponentWrapper as unknown as React.FC<ComponentWrapperProps<Tag>>
  }
}

// Helper function to render a design component
export function renderDesignComponent<Tag extends ComponentTag>({
  pageBuilderMode,
  component,
  selectedComponentId,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
  replaceComponent
}: ComponentWrapperProps<Tag>): ReactNode {
  const WrapperComponent = getWrapperComponent(component.tag)
  const Component = withConnection(getComponentInfo(component.tag).Component)
  const props = {
    pageBuilderMode,
    component,
    selectedComponentId,
    setSelectedComponent,
    updateComponent,
    removeComponent,
    addComponent,
    duplicateComponent,
    replaceComponent,
  }

  const childrenToRender = component.children.map((child) => (
    <React.Fragment key={child.id}>
      {renderDesignComponent({ ...props, component: child } as ComponentWrapperProps<typeof child.tag>)}
    </React.Fragment>
  ))

  return pageBuilderMode === "edit" ? (
    <WrapperComponent {...props}>{childrenToRender}</WrapperComponent>
  ) : (
    <Component
      pageBuilderMode={pageBuilderMode}
      componentId={component.id}
      attributes={component.attributes}
      setSelectedComponent={setSelectedComponent}
      updateComponent={updateComponent}
      removeComponent={removeComponent}
      addComponent={addComponent}
      duplicateComponent={duplicateComponent}
      replaceComponent={replaceComponent}
    >
      {childrenToRender}
    </Component>
  )
}
