'use client'

import OrderCard from './OrderCard'

const COLUMNS_KITCHEN = [
    { id: 'RECEIVED', title: 'A preparer', color: 'amber', bgColor: 'bg-amber-50', accentColor: 'bg-amber-500', borderColor: 'border-amber-100', textColor: 'text-amber-900' },
    { id: 'COOKING', title: 'En cuisine', color: 'blue', bgColor: 'bg-blue-50', accentColor: 'bg-blue-500', borderColor: 'border-blue-100', textColor: 'text-blue-900' },
]

interface KanbanBoardProps {
    orders: any[]
    staff: any
    paymentLogic: 'pay_before' | 'pay_after'
    onUpdateStatus: (id: string, status: string, isPaid?: boolean) => void
    onPrint: (order: any) => void
}

export default function KanbanBoard({ orders, staff, paymentLogic, onUpdateStatus, onPrint }: KanbanBoardProps) {
    return (
        <div className="absolute inset-0 p-4 lg:p-8 flex gap-4 lg:gap-8 overflow-x-auto no-scrollbar animate-in fade-in duration-300">
            {COLUMNS_KITCHEN.map(column => {
                const columnOrders = orders.filter(o => o.production_status === column.id && (paymentLogic === 'pay_after' || o.is_paid))
                return (
                    <div key={column.id} className={`flex-shrink-0 w-[85vw] lg:w-[480px] flex flex-col ${column.bgColor} rounded-[2rem] lg:rounded-[3rem] border ${column.borderColor} p-6 lg:p-8 shadow-sm`}>
                        <div className="flex items-center justify-between mb-6 lg:mb-8 px-2"><h3 className={`font-black text-[10px] lg:text-xs uppercase tracking-widest ${column.textColor} flex items-center gap-2 lg:gap-3`}><span className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${column.accentColor} shadow-lg`} />{column.title}</h3><span className="bg-white border border-zinc-100 text-zinc-900 text-[9px] lg:text-[10px] font-black px-3 py-1 lg:px-4 lg:py-1.5 rounded-full shadow-sm">{columnOrders.length}</span></div>
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 lg:space-y-6 pr-1">
                            {columnOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    staff={staff}
                                    paymentLogic={paymentLogic}
                                    onUpdateStatus={onUpdateStatus}
                                    onPrint={onPrint}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
