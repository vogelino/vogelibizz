import { ProjectType } from '@db/schema'
import {
	AlarmClockCheck,
	CheckSquare,
	Handshake,
	Hourglass,
	LayoutList,
	PauseCircle,
	XCircle,
} from 'lucide-react'
import { ReactNode } from 'react'

type ColorType = 'default' | 'blue' | 'green' | 'red' | 'orange'
const statusToColorMap: Record<string, ColorType> = {
	todo: 'default',
	active: 'blue',
	paused: 'orange',
	done: 'green',
	cancelled: 'red',
	negotiating: 'orange',
	waiting_for_feedback: 'orange',
}
export type StatusType = ProjectType['status']
const statusToLabelMap: Record<StatusType, string> = {
	todo: 'Todo',
	active: 'Active',
	paused: 'Paused',
	done: 'Done',
	cancelled: 'Cancelled',
	negotiating: 'Negotiating',
	waiting_for_feedback: 'Waiting for feedback',
}
const statusToIconMap: Record<StatusType, ReactNode> = {
	todo: <LayoutList size={16} />,
	active: <AlarmClockCheck size={16} />,
	paused: <PauseCircle size={16} />,
	done: <CheckSquare size={16} />,
	cancelled: <XCircle size={16} />,
	negotiating: <Handshake size={16} />,
	waiting_for_feedback: <Hourglass size={16} />,
}

export const statusList = Object.keys(statusToLabelMap).map((key) => ({
	label: statusToLabelMap[key as StatusType],
	value: key,
}))

export function mapStatusToColor(status: StatusType): ColorType {
	return statusToColorMap[status] || 'default'
}

export function mapStatusToLabel(status: StatusType): string {
	return statusToLabelMap[status] || status
}

export function mapStatusToIcon(status: StatusType): ReactNode {
	return statusToIconMap[status] || null
}
