import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: staffId } = await params;

        // Fetch the technician with their deep hierarchy
        const staff = await prisma.service_staff.findUnique({
            where: { id: staffId },
            include: {
                profiles: {
                    select: {
                        full_name: true
                    }
                },
                job_cards: {
                    include: {
                        service_tickets: {
                            include: {
                                service_vehicles: {
                                    include: {
                                        bike_models: true
                                    }
                                },
                                profiles: { // Customer
                                    select: {
                                        id: true,
                                        full_name: true,
                                        email: true,
                                        phone: true
                                    }
                                }
                            }
                        },
                        service_requisitions: {
                            include: {
                                products: true
                            }
                        },
                        service_history: {
                            orderBy: {
                                created_at: 'desc'
                            },
                            take: 1
                        },
                        service_tasks: true
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            }
        });

        if (!staff) {
            return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
        }

        // Helper to convert Prisma Decimals
        const serialize = (obj: any): any => {
            if (obj === null || obj === undefined) return obj;
            if (Array.isArray(obj)) return obj.map(serialize);
            if (typeof obj === 'object') {
                if (obj.constructor && obj.constructor.name === 'Decimal') return Number(obj);
                const newObj: any = {};
                for (const key in obj) newObj[key] = serialize(obj[key]);
                return newObj;
            }
            return obj;
        };

        return NextResponse.json({
            success: true,
            data: serialize(staff)
        });

    } catch (error: any) {
        console.error("[SERVICE_TREE_API_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
