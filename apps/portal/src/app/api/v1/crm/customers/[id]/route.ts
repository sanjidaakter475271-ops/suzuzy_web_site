import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.dealerId && user.role !== 'admin')) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // 1. Fetch Profile (Minimal first)
        let profile;
        try {
            profile = await prisma.profiles.findFirst({
                where: { id, dealer_id: user.dealerId! },
                include: {
                    service_vehicles: {
                        include: { bike_models: { select: { name: true } } }
                    },
                    customer_addresses: true
                }
            });
        } catch (profileError: any) {
            console.error("[CUSTOMER_DETAIL_API] Profile Fetch Error:", profileError);
            return NextResponse.json({ success: false, error: "Failed to fetch profile", detail: profileError.message }, { status: 500 });
        }

        if (!profile) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        // 2. Fetch Service Plans Separately (Prone to P2022)
        let servicePlans: any[] = [];
        try {
            servicePlans = await prisma.customer_service_plans.findMany({
                where: { customer_id: id, is_active: true }
            });
        } catch (planError) {
            console.warn("[CUSTOMER_DETAIL_API] Service plans skipped due to error");
        }

        // 3. Fetch Tickets (Minimal)
        let tickets: any[] = [];
        try {
            tickets = await prisma.service_tickets.findMany({
                where: { customer_id: id },
                orderBy: { created_at: 'desc' }
            });
        } catch (ticketsError: any) {
            console.error("[CUSTOMER_DETAIL_API] Tickets Fetch Error:", ticketsError);
        }

        const ticketIds = tickets.map(t => t.id);

        // 4. Fetch Job Cards for these tickets (Separately)
        let allJobCards: any[] = [];
        if (ticketIds.length > 0) {
            try {
                allJobCards = await prisma.job_cards.findMany({
                    where: { ticket_id: { in: ticketIds } },
                    include: {
                        service_staff: { select: { name: true } },
                        service_tasks: {
                            include: { service_staff: { select: { name: true } } }
                        }
                    }
                });
            } catch (jcError) {
                console.warn("[CUSTOMER_DETAIL_API] Job cards fetch failed, trying minimal...");
                try {
                    allJobCards = await prisma.job_cards.findMany({
                        where: { ticket_id: { in: ticketIds } }
                    });
                } catch (jcError2) {
                    console.error("[CUSTOMER_DETAIL_API] Job cards fetch failed completely");
                }
            }
        }

        // 5. Fetch Invoices for these tickets (Separately)
        let allInvoices: any[] = [];
        if (ticketIds.length > 0) {
            try {
                allInvoices = await prisma.service_invoices.findMany({
                    where: { ticket_id: { in: ticketIds } }
                });
            } catch (invError) {
                console.error("[CUSTOMER_DETAIL_API] Invoices fetch failed");
            }
        }

        // 6. Fetch History (Resiliently)
        let serviceHistoryRecords: any[] = [];
        if (ticketIds.length > 0) {
            try {
                serviceHistoryRecords = await prisma.service_history.findMany({
                    where: { ticket_id: { in: ticketIds } },
                    select: {
                        ticket_id: true,
                        service_sequence: true,
                        service_type: true,
                        is_free_service: true,
                        mileage: true,
                        total_cost: true,
                        summary: true
                    }
                });
            } catch (historyError) {
                console.warn("[CUSTOMER_DETAIL_API] History records skipped");
            }
        }

        // 7. Fetch Complaints (Support Tickets)
        let complaints: any[] = [];
        try {
            complaints = await prisma.support_tickets.findMany({
                where: { user_id: id },
                orderBy: { created_at: 'desc' }
            });
        } catch (complaintError) {
            console.warn("[CUSTOMER_DETAIL_API] Complaints fetch failed");
        }

        // 8. Fetch Ratings (Service Feedback)
        let ratings: any[] = [];
        try {
            ratings = await prisma.service_feedback.findMany({
                where: { user_id: id },
                orderBy: { created_at: 'desc' }
            });
        } catch (ratingError) {
            console.warn("[CUSTOMER_DETAIL_API] Ratings fetch failed");
        }

        // 9. Mapping
        const history = tickets.map(ticket => {
            const jobCard = allJobCards.find(jc => jc.ticket_id === ticket.id);
            const historyRecord = serviceHistoryRecords.find(r => r.ticket_id === ticket.id);
            const invoice = allInvoices.find(inv => inv.ticket_id === ticket.id);

            const techSet = new Set<string>();
            if (jobCard?.service_staff?.name) techSet.add(jobCard.service_staff.name);
            const tasks = jobCard?.service_tasks || [];
            tasks.forEach((task: any) => {
                if (task.service_staff?.name) techSet.add(task.service_staff.name);
            });

            let mileage = historyRecord?.mileage;
            if (!mileage && jobCard?.notes) {
                const match = jobCard.notes.match(/mileage:?\s*(\d+)/i);
                if (match && match[1]) mileage = parseInt(match[1]);
            }

            return {
                id: ticket.id,
                serviceSequence: historyRecord?.service_sequence || undefined,
                serviceDate: ticket.created_at?.toISOString() || new Date().toISOString(),
                vehicleName: profile.service_vehicles.find(v => v.id === ticket.vehicle_id)?.bike_models?.name || "Unknown",
                vehicleId: ticket.vehicle_id || "",
                serviceType: historyRecord?.service_type || (historyRecord?.is_free_service ? "free" : "paid"),
                totalCost: Number(invoice?.grand_total?.toString() || historyRecord?.total_cost?.toString() || 0),
                mileage: mileage,
                summary: historyRecord?.summary || ticket.service_description,
                technicianName: jobCard?.service_staff?.name,
                technicians: Array.from(techSet),
                status: ticket.status,
                tasks: tasks.map((t: any) => t.name),
                ticketId: ticket.id
            };
        });

        const invoices = allInvoices.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            grandTotal: Number(inv.grand_total?.toString() || 0),
            paidAmount: Number(inv.paid_amount?.toString() || 0),
            dueAmount: Number(inv.due_amount?.toString() || 0),
            paymentStatus: inv.payment_status || "unpaid",
            invoiceDate: inv.invoice_date?.toISOString() || inv.created_at?.toISOString() || new Date().toISOString()
        }));

        const totalFreeServices = servicePlans.reduce((sum, p) => sum + (p.total_free_services || 0), 0);
        const usedFreeServices = servicePlans.reduce((sum, p) => sum + (p.used_free_services || 0), 0);

        const firstVehicle = profile.service_vehicles?.[0];

        const responseData = {
            id: profile.id,
            name: profile.full_name,
            phone: profile.phone,
            email: profile.email,
            nid: firstVehicle?.customer_nid,
            profession: firstVehicle?.profession,
            dateOfBirth: firstVehicle?.date_of_birth instanceof Date ? firstVehicle.date_of_birth.toISOString() : firstVehicle?.date_of_birth || null,
            gender: firstVehicle?.gender,
            permanentAddress: {
                division: firstVehicle?.division,
                district: firstVehicle?.district_city,
                thana: firstVehicle?.thana_upozilla,
                postOffice: firstVehicle?.post_office,
                village: firstVehicle?.village_mahalla_para,
                houseRoad: firstVehicle?.house_road_no
            },
            presentAddress: profile.customer_addresses.find(a => a.is_default) || profile.customer_addresses[0],
            vehicles: profile.service_vehicles.map(v => {
                const plan = servicePlans.find(p => p.vehicle_id === v.id);
                return {
                    id: v.id,
                    modelName: v.bike_models?.name || "Unknown Model",
                    chassisNumber: v.chassis_number,
                    engineNumber: v.engine_number,
                    regNo: v.reg_no,
                    color: v.color,
                    purchaseDate: v.date_of_purchase instanceof Date ? v.date_of_purchase.toISOString() : v.date_of_purchase || null,
                    purchaseFrom: v.purchase_from,
                    servicePlan: plan ? {
                        id: plan.id,
                        totalFreeServices: plan.total_free_services,
                        usedFreeServices: plan.used_free_services,
                        remainingFreeServices: Math.max(0, (plan.total_free_services || 0) - (plan.used_free_services || 0)),
                        planType: plan.plan_type,
                        isActive: plan.is_active
                    } : null
                };
            }),
            history,
            invoices,
            complaints: complaints.map(c => ({
                id: c.id,
                subject: c.subject,
                status: c.status,
                priority: c.priority,
                createdAt: c.created_at?.toISOString() || new Date().toISOString()
            })),
            ratings: ratings.map(r => ({
                id: r.id,
                rating: r.rating || 0,
                comment: r.comment || "",
                staffRating: r.staff_rating || 0,
                timingRating: r.timing_rating || 0,
                createdAt: r.created_at?.toISOString() || new Date().toISOString()
            })),
            totalSpent: invoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
            outstandingBalance: invoices.reduce((sum, inv) => sum + inv.dueAmount, 0),
            totalServices: tickets.length,
            totalFreeServices,
            usedFreeServices,
            remainingFreeServices: Math.max(0, totalFreeServices - usedFreeServices),
            totalPaidServices: history.filter(h => h.serviceType === 'paid' || h.serviceType === 'paid_service').length,
            createdAt: profile.created_at instanceof Date ? profile.created_at.toISOString() : profile.created_at || null
        };

        return NextResponse.json({ success: true, data: responseData });
    } catch (error: any) {
        console.error("[CUSTOMER_DETAIL_API] Fatal Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error", detail: error.message }, { status: 500 });
    }
}
