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

export function BudgetDonutChart({
	data = defaultData,
	totalAmount,
	canEdit = false,
	onEditClick,
}: BudgetDonutChartProps) {
	const chartData = React.useMemo(() => {
		const categoryColors: Record<BudgetItem["category"], string> = {
			studentAffairs: chartConfig.studentAffairs.color,
			sponsor: chartConfig.sponsor.color,
			others: chartConfig.others.color,
		}

		return data.map((item) => ({
			...item,
			fill: categoryColors[item.category],
		}))
	}, [data])

	const calculatedTotal = React.useMemo(() => {
		return data.reduce((acc, curr) => acc + curr.amount, 0)
	}, [data])

	const displayTotal = totalAmount ?? calculatedTotal

	const pieChartData = calculatedTotal === 0
		? [{ category: "empty", amount: 1, fill: "#d1d5db" }]
		: chartData

	const renderCustomizedLabel = (props: any) => {
		if (props.name === "empty" || props.value === 0) return null;

		const { cx, cy, midAngle, outerRadius, value, payload, percent } = props;
		const RADIAN = Math.PI / 180;

		const horizontalStretch = Math.abs(Math.cos(-midAngle * RADIAN));
		const radius = outerRadius * (1.2 + (0.35 * horizontalStretch));

		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		const displayName = chartConfig[payload.category as keyof typeof chartConfig]?.label ?? payload.category;

		return (
			<g transform={`translate(${x},${y})`}>
				<text x={0} y={-10.5} textAnchor="middle" fill="#000" fontSize={14} fontWeight={400} dominantBaseline="central">
					{displayName}
				</text>
				<text x={0} y={9.5} textAnchor="middle" fill="#000" fontSize={16} fontWeight={600} dominantBaseline="central">
					฿ {value.toLocaleString("en-US")} <tspan fill="#6b7280" fontSize={10} fontWeight={400}>{(percent * 100).toFixed(0)}%</tspan>
				</text>
			</g>
		);
	};

	return (
		<div className='flex justify-center w-full'>
			<ChartContainer
				config={chartConfig}
				className='shrink-0 aspect-square w-full max-w-[420px]'
			>
				<PieChart style={{ overflow: "visible" }}>
					<Pie
						data={pieChartData}
						dataKey='amount'
						nameKey='category'
						innerRadius="40%"
						outerRadius="62%"
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
									const width = 160;
									const height = 80;
									return (
										<foreignObject
											x={(viewBox.cx || 0) - width / 2}
											y={(viewBox.cy || 0) - height / 2}
											width={width}
											height={height}
										>
											<div className="flex flex-col items-center justify-center w-full h-full px-2 py-1 gap-[5px]">
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
