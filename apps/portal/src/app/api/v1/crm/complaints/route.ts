import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.dealerId && user.role !== 'admin')) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const dealerId = user.dealerId!;

        // Fetch all complaints (support tickets) for this dealer
        const complaints = await prisma.support_tickets.findMany({
            where: {
                dealer_id: dealerId
            },
            include: {
                profiles: {
                    select: { full_name: true, phone: true }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Fetch all service feedback (ratings) for this dealer
        const ratings = await prisma.service_feedback.findMany({
            where: {
                profiles: {
                    dealer_id: dealerId
                }
            },
            include: {
                profiles: {
                    select: { full_name: true, phone: true }
                },
                service_tickets: {
                    select: {
                        service_number: true,
                        service_vehicles: {
                            include: { bike_models: { select: { name: true } } }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Map to standard format
        const formattedComplaints = complaints.map(c => ({
            id: c.id,
            subject: c.subject,
            status: c.status,
            priority: c.priority,
            customerName: c.profiles?.full_name || "Unknown",
            customerPhone: c.profiles?.phone || "N/A",
            createdAt: c.created_at?.toISOString() || new Date().toISOString()
        }));

        const formattedRatings = ratings.map(r => ({
            id: r.id,
            rating: r.rating || 0,
            comment: r.comment || "",
            staffRating: r.staff_rating || 0,
            timingRating: r.timing_rating || 0,
            customerName: r.profiles?.full_name || "Unknown",
            customerPhone: r.profiles?.phone || "N/A",
            ticketNumber: r.service_tickets?.service_number,
            vehicleName: r.service_tickets?.service_vehicles?.bike_models?.name || "Unknown",
            createdAt: r.created_at?.toISOString() || new Date().toISOString()
        }));

        return NextResponse.json({
            success: true,
            data: {
                complaints: formattedComplaints,
                ratings: formattedRatings
            }
        });
    } catch (error: any) {
        console.error("[GLOBAL_COMPLAINTS_API] Error:", error);
        return NextResponse.json({
            success: false,
            error: "Internal server error",
            detail: error.message
        }, { status: 500 });
    }
}
