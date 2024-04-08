'use client'

import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/utility/classNames'
import { ReactNode, useEffect, useMemo, useState } from 'react'

export function Combobox<OptionValueType extends string = string>({
	options,
	onChange = () => undefined,
	value: initialValue,
	searchable = false,
	className,
	selectedValueFormater = (value) =>
		value
			? options.find((option) => option.value === value)?.label
			: 'Select value...',
}: {
	options: {
		label: ReactNode
		value: OptionValueType
	}[]
	searchable?: boolean
	onChange?: (value: OptionValueType) => void
	value?: string
	className?: string
	selectedValueFormater?: (value: OptionValueType) => ReactNode
}) {
	const [open, setOpen] = useState(false)
	const [value, setValue] = useState(initialValue || options[0]?.value)

	useEffect(() => {
		if (!initialValue) return
		setValue(initialValue)
	}, [initialValue])

	const selectedOption = useMemo(
		() => options.find((option) => option.value === value),
		[options, value],
	)
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						'w-fit justify-between rounded-none h-[38px]',
						'hover:bg-alt hover:text-fg border-grayLight',
						'text-base bg-bg dark:bg-grayUltraLight',
						className,
					)}
				>
					<div className="w-full flex gap-3 items-center">
						{selectedOption
							? selectedValueFormater(selectedOption.value)
							: 'Select value...'}
					</div>
					<ChevronsUpDown
						size={16}
						className="translate-y-[3px] ml-2 shrink-0 opacity-50"
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-fit p-0">
				<Command>
					<CommandInput placeholder="Search..." />
					<CommandEmpty>Nothing found.</CommandEmpty>
					<CommandGroup>
						{options.map((option) => (
							<CommandItem
								key={option.value}
								value={option.value}
								onSelect={(currentValue) => {
									const newValue = currentValue === value ? '' : currentValue
									const item = options.find(
										(item) =>
											item.value.toLocaleLowerCase() ===
											newValue.toLocaleLowerCase(),
									)
									if (!item) return
									setValue(item.value)
									onChange(item.value)
									setOpen(false)
								}}
							>
								<Check
									className={cn(
										'mr-2 h-4 w-4',
										value === option.value ? 'opacity-100' : 'opacity-0',
									)}
								/>

								<div className="w-full flex gap-3 items-center">
									{option.label}
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
