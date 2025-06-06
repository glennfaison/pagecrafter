"use client"

import { ImageIcon } from "lucide-react"
import type { ComponentProps, ComponentTag } from "./types"

export type ComponentAttributes = {
	src?: string
	alt?: string
	width?: string
	height?: string
	fallbackSrc?: string
}

export const defaultAttributes: ComponentAttributes = {
	src: "",
	alt: "Image Description",
	width: "100%",
	height: "auto",
	fallbackSrc: "/placeholder.svg?height=200&width=300",
}

export const tag: ComponentTag = "image" as const

export const label = "Image"

export const keywords = ["image", "picture", "photo", "graphic", "media"]

export const settingsFields = {
	src: {
		id: "src",
		type: "text",
		label: "Image Source",
		placeholder: "Enter image URL",
	},
	alt: {
		id: "alt",
		type: "text",
		label: "Alt Text",
		placeholder: "Enter image description",
	},
	width: {
		id: "width",
		type: "text",
		label: "Width",
		placeholder: "Enter width (e.g., 100px, 50%)",
	},
	height: {
		id: "height",
		type: "text",
		label: "Height",
		placeholder: "Enter height (e.g., 100px, auto)",
	},
	fallbackSrc: {
		id: "fallbackSrc",
		type: "text",
		label: "Fallback Image Source",
		placeholder: "Enter fallback image URL",
	},
}

export const Icon = <ImageIcon className="h-4 w-4" />

export const Component = ({
	attributes
}: ComponentProps<typeof tag>) => {
	const { src, alt, fallbackSrc, ...restAttributes } = attributes
	return (
		<img
			src={src || fallbackSrc}
			alt={alt}
			className="max-w-full h-auto"
			{...restAttributes}
		/>
	)
}
