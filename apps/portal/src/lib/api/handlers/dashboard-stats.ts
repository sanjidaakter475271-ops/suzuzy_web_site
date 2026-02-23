import { prisma } from "@/lib/prisma/client";
import { startOfDay, startOfMonth, subMonths, format } from "date-fns";
import { NextResponse } from "next/server";

export async function getDashboardStats(user: any) {
    try {
        const today = startOfDay(new Date());

        // 1. KPIs
        // Note: Logic assumes global visibility or user filtering needs to be added here based on 'user' context
        // If specific scoping is needed, use user.dealerId

        const todayTicketsCount = await prisma.service_tickets.count({
            where: {
                created_at: {
                    gte: today
                }
            }
        });

        const activeRampsCount = await prisma.service_ramps.count({
            where: {
                status: 'busy'
            }
        });
        const totalRampsCount = await prisma.service_ramps.count();

        const techOnDutyCount = await prisma.service_staff.count({
            where: {
                is_active: true
            }
        });

        // Calculate Average TAT
        const completedJobs = await prisma.job_cards.findMany({
            where: {
                status: { in: ['completed', 'finalized'] },
                service_end_time: { not: null },
                service_start_time: { not: null }
            },
            select: {
                service_start_time: true,
                service_end_time: true
            },
            take: 100
        });

        let totalTatMinutes = 0;
        let jobCountForTat = 0;

        completedJobs.forEach(job => {
            if (job.service_end_time && job.service_start_time) {
                const diffMs = job.service_end_time.getTime() - job.service_start_time.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins > 0) {
                    totalTatMinutes += diffMins;
                    jobCountForTat++;
                }
            }
        });

        const avgTat = jobCountForTat > 0
            ? `${Math.floor(totalTatMinutes / jobCountForTat)}m`
            : "N/A";

        // 2. Workshop Widgets Data
        const ramps = await prisma.service_ramps.findMany({
            orderBy: { ramp_number: 'asc' },
            include: {
                service_staff: true,
                service_tickets_service_ramps_current_ticket_idToservice_tickets: {
                    include: {
                        service_vehicles: {
                            include: {
                                bike_models: true
                            }
                        }
                    }
                }
            }
        });

        const formattedRamps = ramps.map(ramp => {
            const currentTicket = ramp.service_tickets_service_ramps_current_ticket_idToservice_tickets;
            return {
                id: ramp.id,
                ramp_number: ramp.ramp_number,
                status: ramp.status,
                technician_name: ramp.service_staff?.name || null,
                current_ticket: currentTicket ? {
                    service_number: currentTicket.service_number,
                    vehicle_model: currentTicket.service_vehicles?.bike_models?.name || 'Unknown Model'
                } : null
            };
        });

        const queuedVehiclesRaw = await prisma.service_tickets.findMany({
            where: { status: 'waiting' },
            orderBy: { created_at: 'asc' },
            take: 10,
            include: {
                service_vehicles: {
                    include: {
                        bike_models: true
                    }
                },
                profiles: true
            }
        });

        const queuedVehicles = queuedVehiclesRaw.map(ticket => ({
            ticket_id: ticket.id,
            service_number: ticket.service_number,
            vehicle_model: ticket.service_vehicles?.bike_models?.name || 'Unknown',
            customer_name: ticket.profiles?.full_name || ticket.service_vehicles?.customer_name || 'Unknown',
            status: ticket.status,
            waiting_since: ticket.created_at ? ticket.created_at.toISOString() : new Date().toISOString()
        }));

        const customerRequestsRaw = await prisma.service_tickets.findMany({
            where: { status: 'waiting', finalized_at: null },
            orderBy: { created_at: 'desc' },
            take: 5,
            include: {
                profiles: true,
                service_vehicles: true
            }
        });

        const customerRequests = customerRequestsRaw.map(req => ({
            id: req.id,
            service_number: req.service_number,
            service_description: req.service_description || 'No description',
            customer_name: req.profiles?.full_name || req.service_vehicles?.customer_name || 'Anonymous',
            created_at: req.created_at ? req.created_at.toISOString() : new Date().toISOString()
        }));


        // 3. Charts Data
        const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
        const transactions = await prisma.transactions.findMany({
            where: {
                created_at: { gte: sixMonthsAgo },
                status: 'completed'
            },
            orderBy: { created_at: 'asc' }
        });

        const revenueMap = new Map<string, { income: number, expense: number }>();

        transactions.forEach(tx => {
            if (!tx.created_at) return;
            const month = format(tx.created_at, 'MMM');
            const data = revenueMap.get(month) || { income: 0, expense: 0 };
            if (tx.type === 'income') data.income += Number(tx.amount);
            if (tx.type === 'expense') data.expense += Number(tx.amount);
            revenueMap.set(month, data);
        });

        const revenueData = Array.from(revenueMap.entries()).map(([month, data]) => ({
            name: month,
            income: data.income,
            expense: data.expense
        }));

        // Expense Breakdown
        const expenses = await prisma.expenses.findMany({
            where: {
                expense_date: { gte: startOfMonth(new Date()) }
            },
            include: {
                expense_categories: true
            }
        });

        const expenseMap = new Map<string, number>();
        expenses.forEach(exp => {
            const catName = exp.expense_categories?.name || 'Uncategorized';
            const current = expenseMap.get(catName) || 0;
            expenseMap.set(catName, current + Number(exp.amount));
        });

        const expenseBreakdown = Array.from(expenseMap.entries()).map(([name, value], index) => ({
            name,
            value,
            color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4] || '#8884d8'
        }));


        // Transaction Volume
        const transactionVolume = revenueData.map(d => ({
            name: d.name,
            income: d.income,
            expense: d.expense
        }));


        // 4. Workshop Pulse
        const activeJobsCount = await prisma.job_cards.count({
            where: { status: 'in_progress' }
        });

        const workshopPulse = {
            activeJobs: activeJobsCount,
            rampUsage: `${activeRampsCount}/${totalRampsCount}`,
            avgTatMinutes: jobCountForTat > 0 ? Math.floor(totalTatMinutes / jobCountForTat) : 0
        };

        // 5. Recent Transactions
        const recentTransactionsRaw = await prisma.transactions.findMany({
            take: 5,
            orderBy: { created_at: 'desc' }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentTransactions = recentTransactionsRaw.map((tx: any) => ({
            id: tx.id,
            title: tx.reference_type === 'service' ? 'Service Payment' : 'Expense',
            category: tx.reference_type || 'General',
            date: tx.created_at ? format(tx.created_at, 'MMM dd, yyyy') : 'N/A',
            amount: `${tx.type === 'expense' ? '-' : '+'}$${tx.amount}`,
            type: tx.type
        }));

        return NextResponse.json({
            success: true,
            data: {
                kpis: {
                    todayTickets: todayTicketsCount,
                    activeRamps: `${activeRampsCount}/${totalRampsCount}`,
                    techOnDuty: techOnDutyCount,
                    avgTAT: avgTat
                },
                ramps: formattedRamps,
                queuedVehicles,
                customerRequests,
                revenueData,
                expenseBreakdown,
                transactionVolume,
                workshopPulse,
                recentTransactions
            }
        });

    } catch (error: any) {
        console.error("Dashboard Stats Handler Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
