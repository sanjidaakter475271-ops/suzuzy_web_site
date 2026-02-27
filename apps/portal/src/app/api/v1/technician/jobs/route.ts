import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

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

export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const query: any = {
            technician_id: technician.serviceStaffId,
            dealer_id: technician.dealerId // Enforce dealer scoping
        };

        if (status && status !== 'all') {
            query.status = status;
        }

        const jobs = await prisma.job_cards.findMany({
            where: query,
            include: {
                service_tickets: {
                    include: {
                        service_vehicles: {
                            include: {
                                bike_models: true,
                            }
                        },
                        profiles: true,
                    }
                },
                service_tasks: true,
                qc_requests: true,
                service_checklist_items: true,
            },
            orderBy: {
                created_at: 'desc',
            },
            skip,
            take: limit,
        });

        const total = await prisma.job_cards.count({ where: query });

        const formattedJobs = jobs.map((job: any) => {
            const ticket = job.service_tickets;
            const vehicle = ticket?.service_vehicles;
            const customer = ticket?.profiles;

            return {
                id: job.id,
                ticket_id: job.ticket_id,
                technician_id: job.technician_id,
                status: job.status,
                notes: job.notes,
                service_start_time: job.service_start_time,
                service_end_time: job.service_end_time,
                created_at: job.created_at,
                service_number: ticket?.service_number,
                vehicle: {
                    model_name: vehicle?.bike_models?.name || vehicle?.model_id || 'Unknown Model',
                    license_plate: vehicle?.engine_number || 'N/A', // The original code uses engine_number for license_plate
                    customer_name: customer?.full_name || vehicle?.customer_name || 'Walk-in Customer',
                    issue_description: ticket?.service_description || 'No description provided',
                    color: vehicle?.color,
                    engine_number: vehicle?.engine_number,
                    chassis_number: vehicle?.chassis_number,
                    mileage: 0,
                },
                tasks: job.service_tasks.map((task: any) => ({
                    id: task.id,
                    name: task.name || 'Service Task',
                    status: task.status || 'pending',
                })),
                qc_status: job.qc_requests?.[0]?.status || null,
                checklist_stats: {
                    total: job.service_checklist_items?.length || 0,
                    completed: job.service_checklist_items?.filter((c: any) => c.is_completed)?.length || 0
                }
            };
        });

        return NextResponse.json({
            success: true,
            data: serialize(formattedJobs),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
