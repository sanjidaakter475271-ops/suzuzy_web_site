import { prisma } from "@/lib/prisma/client";
import { startOfDay, startOfMonth, subMonths, format, subHours, startOfHour, endOfHour } from "date-fns";
import { NextResponse } from "next/server";

export async function getDashboardStats(user: any) {
    try {
        const today = startOfDay(new Date());
        const dealerId = user.dealerId;

        // Scoping
        const scopeWhere = dealerId ? { dealer_id: dealerId } : {};

        // 1. KPIs
        const [todayTicketsCount, activeRampsCount, totalRampsCount, techOnDutyCount] = await Promise.all([
            prisma.service_tickets.count({
                where: {
                    profiles: dealerId ? { dealer_id: dealerId } : {},
                    created_at: { gte: today }
                }
            }),
            prisma.service_ramps.count({
                where: {
                    ...scopeWhere,
                    status: 'busy'
                }
            }),
            prisma.service_ramps.count({
                where: scopeWhere
            }),
            prisma.service_staff.count({
                where: {
                    ...scopeWhere,
                    is_active: true
                }
            })
        ]);

        // 2. Workshop Widgets Data
        const [ramps, queuedVehiclesRaw, customerRequestsRaw] = await Promise.all([
            prisma.service_ramps.findMany({
                where: scopeWhere,
                orderBy: { ramp_number: 'asc' },
                include: {
                    service_staff: true,
                    current_ticket: {
                        include: {
                            service_vehicles: {
                                include: { bike_models: true }
                            }
                        }
                    }
                }
            }),
            prisma.service_tickets.findMany({
                where: {
                    profiles: dealerId ? { dealer_id: dealerId } : {},
                    status: 'waiting'
                },
                orderBy: { created_at: 'asc' },
                take: 10,
                include: {
                    service_vehicles: {
                        include: { bike_models: true }
                    },
                    profiles: true
                }
            }),
            prisma.service_tickets.findMany({
                where: {
                    profiles: dealerId ? { dealer_id: dealerId } : {},
                    status: 'waiting',
                    finalized_at: null
                },
                orderBy: { created_at: 'desc' },
                take: 5,
                include: {
                    profiles: true,
                    service_vehicles: true
                }
            })
        ]);

        const formattedRamps = ramps.map(ramp => {
            const currentTicket = ramp.current_ticket;
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

        const queuedVehicles = queuedVehiclesRaw.map(ticket => ({
            ticket_id: ticket.id,
            service_number: ticket.service_number,
            vehicle_model: ticket.service_vehicles?.bike_models?.name || 'Unknown',
            customer_name: ticket.profiles?.full_name || ticket.service_vehicles?.customer_name || 'Unknown',
            status: ticket.status,
            waiting_since: ticket.created_at ? ticket.created_at.toISOString() : new Date().toISOString()
        }));

        const customerRequests = customerRequestsRaw.map(req => ({
            id: req.id,
            service_number: req.service_number,
            service_description: req.service_description || 'No description',
            customer_name: req.profiles?.full_name || req.service_vehicles?.customer_name || 'Anonymous',
            created_at: req.created_at ? req.created_at.toISOString() : new Date().toISOString()
        }));


        // 3. Charts Data (Last 12 Months)
        const oneYearAgo = startOfMonth(subMonths(new Date(), 11));
        const transactions = await prisma.payment_transactions.findMany({
            where: {
                ...scopeWhere,
                created_at: { gte: oneYearAgo },
                status: 'completed'
            },
            orderBy: { created_at: 'asc' }
        });

        const revenueMap = new Map<string, { income: number, expense: number }>();
        // Initialize last 12 months
        for (let i = 11; i >= 0; i--) {
            const m = format(subMonths(new Date(), i), 'MMM');
            revenueMap.set(m, { income: 0, expense: 0 });
        }

        transactions.forEach(tx => {
            if (!tx.created_at) return;
            const month = format(tx.created_at, 'MMM');
            const data = revenueMap.get(month) || { income: 0, expense: 0 };

            // Map payment_transactions types to income/expense
            const isExpense = ['expense', 'purchase_payment'].includes(tx.transaction_type || '');
            if (isExpense) {
                data.expense += Number(tx.amount);
            } else {
                data.income += Number(tx.amount);
            }
            revenueMap.set(month, data);
        });

        const revenueData = Array.from(revenueMap.entries()).map(([month, data]) => ({
            name: month,
            income: data.income,
            expense: data.expense
        }));

        // Expense Breakdown (Current vs Last Month)
        const [currentExpenses, lastMonthExpenses] = await Promise.all([
            prisma.expenses.findMany({
                where: {
                    ...scopeWhere,
                    expense_date: { gte: startOfMonth(new Date()) }
                },
                include: { expense_categories: true }
            }),
            prisma.expenses.findMany({
                where: {
                    ...scopeWhere,
                    expense_date: {
                        gte: startOfMonth(subMonths(new Date(), 1)),
                        lt: startOfMonth(new Date())
                    }
                },
                include: { expense_categories: true }
            })
        ]);

        const mapExpenses = (exps: any[]) => {
            const map = new Map<string, number>();
            exps.forEach(exp => {
                const catName = exp.expense_categories?.name || 'Uncategorized';
                map.set(catName, (map.get(catName) || 0) + Number(exp.amount));
            });
            return Array.from(map.entries()).map(([name, value], index) => ({
                name,
                value,
                color: ['#D4AF37', '#C75B12', '#DC2626', '#1F9D55', '#3B82F6'][index % 5]
            }));
        };

        const expenseBreakdown = mapExpenses(currentExpenses);
        const lastMonthBreakdown = mapExpenses(lastMonthExpenses);


        // 4. Workshop Pulse
        // Calculate Average TAT
        const completedJobs = await prisma.job_cards.findMany({
            where: {
                ...scopeWhere,
                status: { in: ['completed', 'finalized'] },
                service_end_time: { not: null },
                service_start_time: { not: null }
            },
            select: {
                service_start_time: true,
                service_end_time: true,
                created_at: true
            },
            take: 100,
            orderBy: { created_at: 'desc' }
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

        const activeJobsCount = await prisma.job_cards.count({
            where: {
                ...scopeWhere,
                status: { in: ['in_progress', 'in-service', 'waiting-parts'] }
            }
        });

        const workshopPulse = {
            activeJobs: activeJobsCount,
            rampUsage: `${activeRampsCount}/${totalRampsCount}`,
            avgTatMinutes: jobCountForTat > 0 ? Math.floor(totalTatMinutes / jobCountForTat) : 0
        };

        // 5. Recent Transactions
        const recentTransactionsRaw = await prisma.payment_transactions.findMany({
            where: scopeWhere,
            take: 5,
            orderBy: { created_at: 'desc' },
            include: {
                profiles_payment_transactions_customer_idToprofiles: { select: { full_name: true } },
                vendors: { select: { name: true } }
            }
        });

        const recentTransactions = recentTransactionsRaw.map((tx: any) => ({
            id: tx.id,
            title: tx.profiles_payment_transactions_customer_idToprofiles?.full_name || tx.vendors?.name || tx.transaction_type?.replace('_', ' ').toUpperCase() || 'Transaction',
            category: tx.reference_type || 'General',
            date: tx.created_at ? format(tx.created_at, 'MMM dd, yyyy') : 'N/A',
            amount: `${['expense', 'purchase_payment'].includes(tx.transaction_type || '') ? '-' : '+'}৳${Number(tx.amount).toLocaleString()}`,
            type: ['expense', 'purchase_payment'].includes(tx.transaction_type || '') ? 'expense' : 'income'
        }));

        // 6. Financial Accounts (Real Data from dealer_bank_accounts)
        const accounts = await prisma.dealer_bank_accounts.findMany({
            where: dealerId ? { dealer_id: dealerId } : {}
        });

        const formattedAccounts = accounts.map(acc => ({
            id: acc.id,
            name: acc.account_name || acc.provider_name || 'Bank Account',
            balance: `৳0.00`, // Note: This model doesn't have a balance field, typically linked to ledger
            type: acc.account_type || 'bank',
            number: acc.account_number || 'N/A'
        }));

        // 7. Goals (Pulling from dealer_settings if available)
        const settings = await prisma.dealer_settings.findMany({
            where: {
                dealer_id: dealerId,
                setting_key: { in: ['target_monthly_revenue', 'target_service_volume'] }
            }
        });

        const findSetting = (key: string, def: number) => {
            const s = settings.find(x => x.setting_key === key);
            return s ? Number((s.setting_value as any) || def) : def;
        };

        const revenueTarget = findSetting('target_monthly_revenue', 1000000);
        const volumeTarget = findSetting('target_service_volume', 50);

        const monthlyRevenue = revenueData[revenueData.length - 1]?.income || 0;
        const goals = [
            {
                title: 'Monthly Revenue',
                current: monthlyRevenue,
                target: revenueTarget,
                progress: Math.min(Math.floor((monthlyRevenue / revenueTarget) * 100), 100),
                color: 'bg-brand'
            },
            {
                title: 'Service Volume',
                current: todayTicketsCount,
                target: volumeTarget,
                progress: Math.min(Math.floor((todayTicketsCount / volumeTarget) * 100), 100),
                color: 'bg-emerald-500'
            }
        ];

        // 8. Activity Volume (Last 24 Hours)
        const last24H = subHours(new Date(), 23);
        const [volTickets, volJobs, volSales] = await Promise.all([
            prisma.service_tickets.findMany({
                where: { profiles: dealerId ? { dealer_id: dealerId } : {}, created_at: { gte: last24H } },
                select: { created_at: true }
            }),
            prisma.job_cards.findMany({
                where: { ...scopeWhere, created_at: { gte: last24H } },
                select: { created_at: true }
            }),
            prisma.payment_transactions.findMany({
                where: { ...scopeWhere, created_at: { gte: last24H } },
                select: { created_at: true }
            })
        ]);

        const volumeData = [];
        let lastHourCount = 0;
        const now = new Date();

        for (let i = 23; i >= 0; i--) {
            const hourStart = startOfHour(subHours(now, i));
            const hourEnd = endOfHour(hourStart);
            const hourLabel = format(hourStart, 'hh:mm a');

            const tickets = volTickets.filter(t => t.created_at! >= hourStart && t.created_at! <= hourEnd).length;
            const jobs = volJobs.filter(j => j.created_at! >= hourStart && j.created_at! <= hourEnd).length;
            const sales = volSales.filter(s => s.created_at! >= hourStart && s.created_at! <= hourEnd).length;

            volumeData.push({ time: hourLabel, tickets, jobs, sales });
            if (i === 0) lastHourCount = tickets + jobs + sales;
        }

        const total24H = volTickets.length + volJobs.length + volSales.length;
        const todayCount = volTickets.filter(t => t.created_at! >= today).length +
            volJobs.filter(j => j.created_at! >= today).length +
            volSales.filter(s => s.created_at! >= today).length;

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
                transactionVolume: revenueData,
                workshopPulse,
                recentTransactions,
                accounts: formattedAccounts,
                goals,
                volume: {
                    data: volumeData,
                    total: total24H,
                    today: todayCount,
                    lastHour: lastHourCount
                }
            }
        });

    } catch (error: any) {
        console.error("Dashboard Stats Handler Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
