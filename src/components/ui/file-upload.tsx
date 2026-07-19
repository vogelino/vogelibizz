"use client";

import { File as FileIcon, Upload, X } from "lucide-react";
import { forwardRef, type ReactNode, type Ref, useRef, useState } from "react";
import { cn } from "@/utility/classNames";
import { Button } from "./button";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
	if (typeof ref === "function") ref(value);
	else if (ref) ref.current = value;
}

function matchesAccept(file: File, accept: string) {
	if (!accept.trim()) return true;
	const filename = file.name.toLowerCase();
	const mimeType = file.type.toLowerCase();
	return accept.split(",").some((rawType) => {
		const type = rawType.trim().toLowerCase();
		if (!type) return false;
		if (type.startsWith(".")) return filename.endsWith(type);
		if (type.endsWith("/*")) return mimeType.startsWith(type.slice(0, -1));
		return mimeType === type;
	});
}

function formatFileSize(bytes: number) {
	if (bytes < 1_000) return `${bytes} B`;
	if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(1)} KB`;
	return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export type FileUploadProps = {
	files: readonly File[];
	onFilesChange: (files: File[]) => void;
	accept?: string;
	multiple?: boolean;
	hideDropzoneWhenFilesSelected?: boolean;
	disabled?: boolean;
	invalid?: boolean;
	title?: ReactNode;
	description?: ReactNode;
	className?: string;
	inputId?: string;
	name?: string;
};

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
	(
		{
			files,
			onFilesChange,
			accept = "",
			multiple = false,
			hideDropzoneWhenFilesSelected = false,
			disabled = false,
			invalid = false,
			title = "Drop files here, or click to browse",
			description,
			className,
			inputId,
			name,
		},
		forwardedRef,
	) => {
		const inputRef = useRef<HTMLInputElement | null>(null);
		const [dragging, setDragging] = useState(false);
		const [rejection, setRejection] = useState<string | null>(null);
		const dropzoneVisible =
			!hideDropzoneWhenFilesSelected || files.length === 0;
		const canSelectFiles = !disabled && dropzoneVisible;

		const selectFiles = (nextFiles: File[]) => {
			const acceptedFiles = nextFiles.filter((file) =>
				matchesAccept(file, accept),
			);
			if (acceptedFiles.length !== nextFiles.length) {
				setRejection(
					"One or more files use an unsupported format and were not added.",
				);
			} else {
				setRejection(null);
			}
			if (acceptedFiles.length > 0 || nextFiles.length === 0) {
				onFilesChange(multiple ? acceptedFiles : acceptedFiles.slice(0, 1));
			}
		};

		return (
			<div className={cn("min-w-0", className)}>
				<fieldset
					aria-label="File upload"
					className={cn(
						"border border-dashed border-border bg-muted/30 transition-colors",
						!dropzoneVisible && "border-solid",
						dragging && "border-primary bg-primary/5",
						(invalid || rejection) && "border-destructive/60 bg-destructive/5",
						disabled && "pointer-events-none opacity-50",
					)}
					onDragEnter={(event) => {
						event.preventDefault();
						if (canSelectFiles) setDragging(true);
					}}
					onDragOver={(event) => {
						event.preventDefault();
						event.dataTransfer.dropEffect = canSelectFiles ? "copy" : "none";
					}}
					onDragLeave={(event) => {
						const nextTarget = event.relatedTarget;
						if (
							!(nextTarget instanceof Node) ||
							!event.currentTarget.contains(nextTarget)
						) {
							setDragging(false);
						}
					}}
					onDrop={(event) => {
						event.preventDefault();
						setDragging(false);
						if (canSelectFiles)
							selectFiles(Array.from(event.dataTransfer.files));
					}}
				>
					<input
						ref={(node) => {
							inputRef.current = node;
							assignRef(forwardedRef, node);
						}}
						id={inputId}
						name={name}
						type="file"
						accept={accept}
						multiple={multiple}
						disabled={disabled}
						aria-invalid={invalid || Boolean(rejection)}
						onChange={(event) =>
							selectFiles(Array.from(event.currentTarget.files ?? []))
						}
						className="sr-only"
					/>
					{dropzoneVisible ? (
						<button
							type="button"
							disabled={disabled}
							onClick={() => {
								if (!inputRef.current) return;
								inputRef.current.value = "";
								inputRef.current.click();
							}}
							className="focusable flex w-full cursor-pointer flex-col items-center justify-center px-6 py-8 text-center"
						>
							<span className="mb-3 flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
								<Upload size={20} aria-hidden="true" />
							</span>
							<span className="font-medium">
								{dragging ? "Drop files to upload" : title}
							</span>
							{description ? (
								<span className="mt-1 text-sm text-muted-foreground">
									{description}
								</span>
							) : null}
						</button>
					) : null}

					{files.length > 0 ? (
						<ul
							className={cn(
								"bg-background px-3",
								dropzoneVisible && "border-t border-border",
							)}
						>
							{files.map((file, index) => (
								<li
									key={`${file.name}-${file.size}-${file.lastModified}`}
									className="flex min-w-0 items-center gap-3 py-3"
								>
									<FileIcon
										size={18}
										className="shrink-0 text-muted-foreground"
										aria-hidden="true"
									/>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">{file.name}</p>
										<p className="text-xs text-muted-foreground">
											{formatFileSize(file.size)}
										</p>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										disabled={disabled}
										onClick={() => {
											if (inputRef.current) inputRef.current.value = "";
											setRejection(null);
											onFilesChange(
												files.filter((_, fileIndex) => fileIndex !== index),
											);
										}}
										aria-label={`Remove ${file.name}`}
									>
										<X size={16} />
									</Button>
								</li>
							))}
						</ul>
					) : null}
				</fieldset>
				{rejection ? (
					<p role="alert" className="mt-2 text-sm text-destructive">
						{rejection}
					</p>
				) : null}
			</div>
		);
	},
);
FileUpload.displayName = "FileUpload";
