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
                service_history: {
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: 1
                },
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
            service_number: ticket?.service_number || 'N/A',
            status: job.status,
            qc_status: latestQC ? latestQC.status : null,
            vehicle: vehicle ? {
                model_name: vehicle.bike_models?.name || 'Unknown',
                license_plate: vehicle.engine_number || 'N/A',
                customer_name: vehicle.customer_name || ticket?.profiles?.full_name || 'Generic Customer',
                issue_description: ticket?.service_description || 'Routine maintenance',
                color: vehicle.color || 'N/A',
                engine_number: vehicle.engine_number || 'N/A',
                chassis_number: vehicle.chassis_number || 'N/A',
                mileage: job.service_history?.[0]?.mileage || 0,
            } : null,
            tasks: job.service_tasks?.map((t) => ({
                id: t.id,
                name: t.name || 'Unnamed Task',
                status: t.status,
            })) || [],
            checklist: job.service_checklist_items?.map(i => ({
                id: i.id,
                name: i.name,
                category: i.category,
                is_completed: i.is_completed,
                condition: i.condition,
                photo_url: i.photo_url,
            })) || [],
            checklist_stats: {
                total: totalChecklist,
                completed: completedChecklist,
            },
            parts: job.parts_usage?.map((p) => ({
                id: p.id,
                variant_id: p.variant_id,
                part_name: p.part_variants?.parts?.name || p.part_variants?.brand || 'Unknown Part',
                quantity: p.quantity,
                price: p.part_variants?.price ? Number(p.part_variants.price) : 0,
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
                image_url: p.image_url,
                tag: p.tag,
                metadata: p.metadata,
                created_at: p.created_at
            })) || [],
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
