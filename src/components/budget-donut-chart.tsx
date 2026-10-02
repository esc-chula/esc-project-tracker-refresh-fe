'use client'

import * as React from 'react'
import { Label, Pie, PieChart } from 'recharts'
import Image from 'next/image'

import { ChartConfig, ChartContainer } from '@/components/ui/chart'

export type BudgetItem = {
	category: "studentAffairs" | "sponsor" | "others"
	amount: number
}

interface BudgetDonutChartProps {
	data?: BudgetItem[]
	totalAmount?: number
	canEdit?: boolean
	onEditClick?: () => void
}

const chartConfig = {
	amount: {
		label: 'งบประมาณ',
	},
	studentAffairs: {
		label: 'กิจการนิสิต',
		color: '#b91c1c',
	},
	sponsor: {
		label: 'สปอนเซอร์',
		color: '#f87171',
	},
	others: {
		label: 'อื่น ๆ',
		color: '#fecaca',
	},
} satisfies ChartConfig

const defaultData: BudgetItem[] = [
	{ category: 'studentAffairs', amount: 0 },
	{ category: 'sponsor', amount: 0 },
	{ category: 'others', amount: 0 },
]

const labelName = (category: string) => chartConfig[category as keyof typeof chartConfig]?.label ?? category

const LABEL_H = 46
const LABEL_GAP = 12

function layoutLabels(items: { value: number; w: number }[], cx: number, cy: number, outerRadius: number, k: number) {
	const total = items.reduce((a, b) => a + b.value, 0)
	let cum = 0
	const pts = items.map(({ value, w }) => {
		const rad = (-(90 + (360 * (cum + value / 2)) / total) * Math.PI) / 180
		cum += value
		const r = outerRadius + LABEL_GAP + Math.abs(Math.cos(rad)) * (w / 2) + Math.abs(Math.sin(rad)) * ((LABEL_H * k) / 2)
		return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
	})
	for (let i = 0; i < pts.length; i++) {
		for (let j = i + 1; j < pts.length; j++) {
			if (!items[i].value || !items[j].value) continue
			const dx = pts[j].x - pts[i].x
			const need = (items[i].w + items[j].w) / 2 + 6
			if (Math.abs(dx) >= need || Math.abs(pts[j].y - pts[i].y) >= LABEL_H * k) continue
			const shift = ((need - Math.abs(dx)) / 2) * (dx >= 0 ? 1 : -1)
			pts[i].x -= shift
			pts[j].x += shift
		}
	}
	return pts.map((p, i) => ({
		x: Math.min(Math.max(p.x, items[i].w / 2), 2 * cx - items[i].w / 2),
		y: Math.min(Math.max(p.y, (LABEL_H * k) / 2), 2 * cy - (LABEL_H * k) / 2),
	}))
}

export function BudgetDonutChart({
	data = defaultData,
	totalAmount,
	canEdit = false,
	onEditClick,
}: BudgetDonutChartProps) {
	const chartRef = React.useRef<HTMLDivElement>(null)
	const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)

	React.useLayoutEffect(() => {
		const el = chartRef.current
		if (!el) return
		const observer = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	const calculatedTotal = React.useMemo(() => data.reduce((acc, curr) => acc + curr.amount, 0), [data])

	const displayTotal = totalAmount ?? calculatedTotal

	const pieChartData = React.useMemo(
		() =>
			calculatedTotal === 0
				? [{ category: "empty", amount: 1, fill: "#d1d5db" }]
				: data.map((item) => ({ ...item, fill: chartConfig[item.category].color })),
		[data, calculatedTotal]
	)

	const labelWidths = React.useMemo(() => {
		if (!size) return pieChartData.map(() => 0)
		const ctx = document.createElement("canvas").getContext("2d")
		const family = getComputedStyle(chartRef.current!).fontFamily
		const measure = (text: string, weight: number, px: number) => {
			if (ctx) ctx.font = `${weight} ${px}px ${family}`
			return ctx?.measureText(text).width ?? 0
		}
		return pieChartData.map((d) => {
			const pct = `${Math.round((d.amount / calculatedTotal) * 100)}%`
			return Math.max(
				measure(labelName(d.category), 400, 14),
				measure(`฿ ${d.amount.toLocaleString("en-US")} `, 600, 16) + measure(pct, 400, 10)
			) + 8
		})
	}, [pieChartData, calculatedTotal, size])

	const geometry = React.useMemo(() => {
		if (!size || calculatedTotal === 0) return null
		const base = (0.62 * Math.min(size.w, size.h)) / 2
		const widest = Math.max(...labelWidths)
		const outerAt = (k: number) =>
			Math.min(base, size.w / 2 - LABEL_GAP - widest * k, size.h / 2 - LABEL_GAP - LABEL_H * k)
		const k = [1, 0.9, 0.8].find((k) => outerAt(k) >= 0.8 * base) ?? 0.7
		return { k, outer: Math.max(outerAt(k), 24) }
	}, [size, calculatedTotal, labelWidths])

	const k = geometry?.k ?? 1

	const renderCustomizedLabel = (props: any) => {
		if (props.name === "empty" || props.value === 0) return null;

		const { cx, cy, outerRadius, value, payload, percent, index } = props;
		const items = pieChartData.map((d, i) => ({ value: d.amount, w: labelWidths[i] * k }))
		const { x, y } = layoutLabels(items, cx, cy, outerRadius, k)[index];

		return (
			<g transform={`translate(${x},${y})`}>
				<text x={0} y={-10.5 * k} textAnchor="middle" fill="#000" fontSize={14 * k} fontWeight={400} dominantBaseline="central">
					{labelName(payload.category)}
				</text>
				<text x={0} y={9.5 * k} textAnchor="middle" fill="#000" fontSize={16 * k} fontWeight={600} dominantBaseline="central">
					฿ {value.toLocaleString("en-US")} <tspan fill="#6b7280" fontSize={10 * k} fontWeight={400}>{Math.round(percent * 100)}%</tspan>
				</text>
			</g>
		);
	};

	return (
		<div className='flex justify-center w-full'>
			<ChartContainer
				ref={chartRef}
				config={chartConfig}
				className='shrink-0 aspect-[16/11] min-h-[280px] w-full max-w-[720px]'
			>
				<PieChart style={{ overflow: "visible" }}>
					<Pie
						data={pieChartData}
						dataKey='amount'
						nameKey='category'
						innerRadius={geometry ? (geometry.outer * 40) / 62 : "40%"}
						outerRadius={geometry ? geometry.outer : "62%"}
						startAngle={90}
						endAngle={450}
						strokeWidth={5}
						isAnimationActive={false}
						labelLine={false}
						label={renderCustomizedLabel}
					>
						<Label
							content={({ viewBox }) => {
								if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
									const hole = 2 * ((viewBox as { innerRadius?: number }).innerRadius ?? 80)
									const scale = Math.min(1, (hole * 0.85) / (`฿ ${displayTotal.toLocaleString('en-US')}`.length * 12))
									const width = 160;
									const height = 80;
									return (
										<foreignObject
											x={(viewBox.cx || 0) - width / 2}
											y={(viewBox.cy || 0) - height / 2}
											width={width}
											height={height}
										>
											<div className="flex flex-col items-center justify-center w-full h-full px-2 py-1 gap-[5px]" style={{ transform: `scale(${scale})` }}>
												<div className="flex items-center gap-1">
													<span className="text-[15px] text-black leading-none mt-0.5">งบรวม</span>
													{canEdit && (
														<button
															type="button"
															onClick={onEditClick}
															className="cursor-pointer"
															aria-label="แก้ไขงบประมาณ"
														>
															<Image
																src="/icons/pencil.svg"
																width={16}
																height={16}
																alt=""
															/>
														</button>
													)}
												</div>
												<span className="text-[20px] font-bold text-black leading-none">
													฿ {displayTotal.toLocaleString('en-US')}
												</span>
											</div>
										</foreignObject>
									)
								}
							}}
						/>
					</Pie>
				</PieChart>
			</ChartContainer>
		</div>
	)
}
