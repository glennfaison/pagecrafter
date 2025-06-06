import { Heading } from "lucide-react"
import { ComponentProps, ComponentTag } from "./types"
import React from "react"
import { withTextEditing } from "./content-editable-hoc"

export type ComponentAttributes = {
	content: string
}

export const defaultAttributes: ComponentAttributes = {
	content: "Header 2",
}

export const tag: ComponentTag = "header2" as const

export const label = "Header 2"

export const keywords = ["h2", "title", "subtitle", "header", "heading", "medium"]

export const settingsFields = {
	content: {
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter header text",
	},
}

export const Icon = <Heading className="h-4 w-4" />

export const Component = withTextEditing((props: ComponentProps<typeof tag>) => {
	const { content } = props.attributes
	return (
		<h2 className="text-3xl font-bold py-2" {...props}>{content}</h2>
	)
})