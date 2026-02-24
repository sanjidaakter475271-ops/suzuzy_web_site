import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const job = await prisma.job_cards.findFirst({
            where: {
                id,
                technician_id: technician.serviceStaffId,
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
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Use any cast to bypass TypeScript inference issues with complex Prisma includes
        const jobData = job as any;
        const ticket = jobData.service_tickets;
        const vehicle = ticket?.service_vehicles;
        const latestQC = jobData.qc_requests?.[0];

        // Calculate checklist stats
        const totalChecklist = jobData.service_checklist_items?.length || 0;
        const completedChecklist = jobData.service_checklist_items?.filter((i: any) => i.is_completed).length || 0;

        const formattedJob = {
            id: jobData.id,
            jobNumber: ticket?.service_number || 'N/A',
            status: jobData.status,
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
            tasks: jobData.service_tasks?.map((t: any) => ({
                id: t.id,
                name: t.task_name || 'Unnamed Task',
                status: t.status,
            })) || [],
            parts: jobData.parts_usage?.map((p: any) => ({
                id: p.id,
                name: p.part_variants?.parts?.name || p.part_variants?.brand || 'Unknown Part',
                quantity: p.quantity,
            })) || [],
            requisitions: jobData.service_requisitions?.map((r: any) => ({
                id: r.id,
                productName: r.products?.name || 'Unknown',
                quantity: r.quantity,
                status: r.status,
                notes: r.notes,
                createdAt: r.created_at
            })) || [],
            photos: jobData.job_photos?.map((p: any) => ({
                id: p.id,
                url: p.photo_url,
                type: p.photo_type,
            })) || [],
            checklist_stats: {
                total: totalChecklist,
                completed: completedChecklist,
            },
            time_logs: jobData.technician_time_logs || [],
            notes: jobData.notes,
            created_at: jobData.created_at,
        };

        return NextResponse.json(formattedJob);
    } catch (error) {
        console.error('Error fetching job details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
