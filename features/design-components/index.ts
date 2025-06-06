"use client"

import type { ComponentAttributes, ComponentInfo, ComponentTag, DesignComponent } from "./types"

import * as Header1 from "./header1"
import * as Header2 from "./header2"
import * as Header3 from "./header3"
import * as Paragraph from "./paragraph"
import * as InlineText from "./inline-text"
import * as Button from "./button"
import * as Image from "./image"
import * as Row from "./row"
import * as Column from "./column"

// Helper function to get component data by type using exhaustive switch
export function getComponentInfo<Tag extends ComponentTag>(tag: Tag): ComponentInfo<Tag> {
  switch (tag) {
    case "header1":
      return Header1 as unknown as ComponentInfo<Tag>;
    case "header2":
      return Header2 as unknown as ComponentInfo<Tag>;
    case "header3":
      return Header3 as unknown as ComponentInfo<Tag>;
    case "paragraph":
      return Paragraph as unknown as ComponentInfo<Tag>;
    case "inline-text":
      return InlineText as unknown as ComponentInfo<Tag>;
    case "button":
      return Button as unknown as ComponentInfo<Tag>;
    case "image":
      return Image as unknown as ComponentInfo<Tag>;
    case "row":
      return Row as unknown as ComponentInfo<Tag>;
    case "column":
      return Column as unknown as ComponentInfo<Tag>;
    default:
      const _unexpected: never = tag
      throw new Error(`Unknown component type: ${_unexpected}`)
  }
}

// Helper function to create a new design component
export function createDesignComponent<Tag extends ComponentTag>(
  tag: Tag,
  id: string,
  overrideProps?: Partial<ComponentAttributes<Tag>>,
): DesignComponent<Tag> {
  const data = getComponentInfo(tag)
  return {
    id: `${tag}-${id}`,
    tag: tag,
    attributes: { ...data.defaultAttributes, ...overrideProps } as ComponentAttributes<Tag>,
    children: [],
    settingsFields: data.settingsFields,
  }
}

export const componentTagList = [
  Header1.tag,
  Header2.tag,
  Header3.tag,
  Paragraph.tag,
  InlineText.tag,
  Button.tag,
  Image.tag,
  Row.tag,
  Column.tag,
]
