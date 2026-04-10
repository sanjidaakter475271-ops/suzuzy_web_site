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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Fetch profile with vehicles, addresses and service plans
        const profile = await prisma.profiles.findFirst({
            where: {
                id,
                dealer_id: user.dealerId
            },
            include: {
                service_vehicles: {
                    include: {
                        bike_models: {
                            select: { name: true }
                        },
                        customer_service_plans: {
                            where: { is_active: true }
                        }
                    }
                },
                customer_addresses: true
            }
        });

        if (!profile) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Fetch all service history for these vehicles
        const vehicleIds = profile.service_vehicles.map(v => v.id);
        const serviceHistory = await prisma.service_history.findMany({
            where: {
                vehicle_id: { in: vehicleIds }
            },
            orderBy: {
                service_date: 'desc'
            },
            include: {
                service_vehicles: {
                    select: {
                        bike_models: { select: { name: true } }
                    }
                }
            }
        });

        // Fetch invoices for financial summary
        const invoices = await prisma.service_invoices.findMany({
            where: {
                dealer_id: user.dealerId as string,
                service_tickets: {
                    customer_id: id
                }
            }
        });

        // Calculate totals
        const totalSpent = invoices.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);
        const totalDue = invoices.reduce((sum, inv) => sum + Number(inv.due_amount || 0), 0);
        const totalServices = serviceHistory.length;

        // Map to response format
        const responseData = {
            id: profile.id,
            name: profile.full_name,
            phone: profile.phone,
            email: profile.email,
            nid: profile.service_vehicles[0]?.customer_nid,
            profession: profile.service_vehicles[0]?.profession,
            dateOfBirth: profile.service_vehicles[0]?.date_of_birth,
            gender: profile.service_vehicles[0]?.gender,
            permanentAddress: {
                division: profile.service_vehicles[0]?.division,
                district: profile.service_vehicles[0]?.district_city,
                thana: profile.service_vehicles[0]?.thana_upozilla,
                postOffice: profile.service_vehicles[0]?.post_office,
                village: profile.service_vehicles[0]?.village_mahalla_para,
                houseRoad: profile.service_vehicles[0]?.house_road_no
            },
            presentAddress: profile.customer_addresses.find(a => a.is_default) || profile.customer_addresses[0],
            vehicles: profile.service_vehicles.map(v => ({
                id: v.id,
                modelName: v.bike_models?.name || "Unknown Model",
                chassisNumber: v.chassis_number,
                engineNumber: v.engine_number,
                regNo: v.reg_no,
                color: v.color,
                purchaseDate: v.date_of_purchase,
                purchaseFrom: v.purchase_from,
                servicePlan: v.customer_service_plans[0] ? {
                    id: v.customer_service_plans[0].id,
                    totalFreeServices: v.customer_service_plans[0].total_free_services,
                    usedFreeServices: v.customer_service_plans[0].used_free_services,
                    remainingFreeServices: v.customer_service_plans[0].total_free_services - v.customer_service_plans[0].used_free_services,
                    planType: v.customer_service_plans[0].plan_type,
                    isActive: v.customer_service_plans[0].is_active
                } : null
            })),
            history: serviceHistory.map(h => ({
                id: h.id,
                serviceSequence: h.service_sequence,
                serviceDate: h.service_date,
                vehicleName: h.service_vehicles?.bike_models?.name || "Unknown",
                vehicleId: h.vehicle_id,
                serviceType: h.service_type || (h.is_free_service ? "free" : "paid"),
                totalCost: Number(h.total_cost || 0),
                mileage: h.mileage,
                summary: h.summary,
                nextServiceDueDate: h.next_service_due_date,
                nextServiceDueMileage: h.next_service_due_mileage
            })),
            totalSpent,
            outstandingBalance: totalDue,
            totalServices,
            createdAt: profile.created_at
        };

        return NextResponse.json({ success: true, data: responseData });
    } catch (error: any) {
        console.error("[CUSTOMER_DETAIL_API]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
