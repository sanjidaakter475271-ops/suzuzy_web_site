import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

type Params = Promise<{ id: string }>;

// Helper to convert Prisma Decimals to Numbers
const serialize = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(serialize);
    if (typeof obj === 'object') {
        if (obj.constructor && obj.constructor.name === 'Decimal') {
            return Number(obj);
        }
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = serialize(obj[key]);
        }
        return newObj;
    }
    return obj;
};

export async function GET(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const job = await prisma.job_cards.findFirst({
            where: {
                id,
                technician_id: technician.serviceStaffId,
                dealer_id: technician.dealerId // Enforce dealer scoping
            },
            include: {
                service_tickets: {
                    include: {
                        service_vehicles: {
                            include: {
                                bike_models: true,
                            },
                        },
                        profiles: true, // Customer
                    },
                },
                service_tasks: true,
                parts_usage: {
                    include: {
                        part_variants: {
                            include: {
                                parts: true
                            }
                        }
                    }
                },
                job_photos: true,
                service_checklist_items: true,
                technician_time_logs: {
                    orderBy: {
                        timestamp: 'desc'
                    }
                },
                qc_requests: {
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: 1
                },
                service_requisitions: {
                    include: {
                        products: true
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            },
        });

        if (!job) {
            return NextResponse.json({ success: false, error: 'Job not found or access denied' }, { status: 404 });
        }

        const ticket = job.service_tickets;
        const vehicle = ticket?.service_vehicles;
        const latestQC = job.qc_requests?.[0];

        // Calculate checklist stats
        const totalChecklist = job.service_checklist_items?.length || 0;
        const completedChecklist = job.service_checklist_items?.filter(i => i.is_completed).length || 0;

        const formattedJob = {
            id: job.id,
            jobNumber: ticket?.service_number || 'N/A',
            status: job.status,
            qc_status: latestQC ? latestQC.status : null,
            ticket: ticket ? {
                id: ticket.id,
                serviceNumber: ticket.service_number,
                status: ticket.status,
                description: ticket.service_description,
                customer: ticket.profiles ? {
                    name: ticket.profiles.full_name,
                    phone: ticket.profiles.phone,
                } : null,
                vehicle: vehicle ? {
                    regNumber: vehicle.engine_number || 'N/A',
                    model: vehicle.bike_models?.name || 'Unknown',
                    registration: vehicle.engine_number || 'N/A',
                    chassisNumber: vehicle.chassis_number || 'N/A',
                } : null,
            } : null,
            tasks: job.service_tasks?.map((t) => ({
                id: t.id,
                name: t.name || 'Unnamed Task',
                status: t.status,
            })) || [],
            parts: job.parts_usage?.map((p) => ({
                id: p.id,
                name: p.part_variants?.parts?.name || p.part_variants?.brand || 'Unknown Part',
                quantity: p.quantity,
            })) || [],
            requisitions: job.service_requisitions?.map((r) => ({
                id: r.id,
                productName: r.products?.name || 'Unknown',
                quantity: r.quantity,
                status: r.status,
                notes: r.notes,
                createdAt: r.created_at
            })) || [],
            photos: job.job_photos?.map((p) => ({
                id: p.id,
                url: p.image_url,
                type: p.tag,
            })) || [],
            checklist_stats: {
                total: totalChecklist,
                completed: completedChecklist,
            },
            time_logs: job.technician_time_logs || [],
            notes: job.notes,
            created_at: job.created_at,
        };

        return NextResponse.json({ success: true, data: serialize(formattedJob) });
    } catch (error: unknown) {
        console.error('Error fetching job details:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
