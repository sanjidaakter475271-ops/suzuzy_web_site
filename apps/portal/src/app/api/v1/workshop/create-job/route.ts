import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcast } from "@/lib/socket-server";

/**
 * Generate a human-readable unique number
 * Format: PREFIX-YYYYMMDD-XXXX
 */
function generateUniqueNumber(prefix: string): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${date}-${random}`;
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const body = await req.json();

        const {
            customer_name,
            customer_phone,
            customer_address,
            vehicle_reg_no,
            vehicle_model,
            vehicle_chassis_no,
            service_type,
            complaints,
            custom_complaint,
            estimated_completion,
            ramp_id,
            technician_id,
            appointment_id
        } = body;

        if (!customer_phone || !vehicle_reg_no || !vehicle_model) {
            return NextResponse.json({ error: "Missing required fields (phone, reg_no, model)" }, { status: 400 });
        }

        // 1. Perform transaction to create Vehicle -> Ticket -> Job Card
        const result = await prisma.$transaction(async (tx) => {
            // Find existing customer by phone
            const customer = await tx.profiles.findFirst({
                where: { phone: customer_phone, dealer_id: user.dealerId }
            });
            const customer_id = customer?.id || null;

            // A. Create/Update Vehicle
            const vehicle = await tx.service_vehicles.upsert({
                where: { engine_number: vehicle_reg_no },
                update: {
                    customer_name,
                    customer_id: customer_id,
                    phone_number: customer_phone,
                    district_city: customer_address || '',
                    chassis_number: vehicle_chassis_no || '',
                },
                create: {
                    engine_number: vehicle_reg_no,
                    chassis_number: vehicle_chassis_no || '',
                    customer_name,
                    customer_id: customer_id,
                    phone_number: customer_phone,
                    district_city: customer_address || '',
                }
            });

            // B. Create Service Ticket
            const serviceNumber = generateUniqueNumber('ST');
            const serviceTicket = await tx.service_tickets.create({
                data: {
                    vehicle_id: vehicle.id,
                    customer_id: customer_id,
                    service_number: serviceNumber,
                    status: 'waiting',
                    service_description: complaints + (custom_complaint ? `\nNote: ${custom_complaint}` : ''),
                    admin_notes: `Manual creation via portal. Type: ${service_type}`,
                    ramp_id: ramp_id || null,
                    staff_id: technician_id || null,
                    appointment_id: appointment_id || null,
                } as any
            });

            // C. Create Job Card
            const jobCard = await tx.job_cards.create({
                data: {
                    ticket_id: serviceTicket.id,
                    technician_id: technician_id || null,
                    status: 'pending',
                    notes: complaints,
                    dealer_id: user.dealerId,
                    estimated_completion_at: estimated_completion ? new Date(estimated_completion) : null
                },
            });

            // D. Update Ramp if assigned
            if (ramp_id) {
                await tx.service_ramps.update({
                    where: { id: ramp_id },
                    data: {
                        status: 'occupied',
                        current_ticket_id: serviceTicket.id,
                        staff_id: technician_id || null
                    }
                });
            }

            // F. Create Notification for technician
            if (technician_id) {
                // Find profile ID for the technician (staff_id -> profile_id)
                const staff = await tx.service_staff.findUnique({
                    where: { id: technician_id },
                    select: { profile_id: true }
                });

                if (staff?.profile_id) {
                    await tx.notifications.create({
                        data: {
                            user_id: staff.profile_id,
                            title: "New Job Assigned",
                            message: `You have been assigned to a new ${vehicle_model} (Reg: ${vehicle_reg_no}). Job #: ${serviceNumber}`,
                            type: 'job',
                            link_url: `/job/${jobCard.id}`
                        }
                    });
                }
            }

            return { vehicle, serviceTicket, jobCard };
        });

        // 2. Broadcast Real-time Events
        await broadcast('job_cards:changed', {
            action: 'created',
            id: result.jobCard.id,
            ticketId: result.serviceTicket.id,
            technicianId: technician_id
        });

        if (technician_id) {
            await broadcast('notification:new', {
                technician_id: technician_id,
                title: "New Job Assigned",
                message: `You have been assigned to Job Card: ${result.serviceTicket.service_number}`,
                type: 'job'
            });
        }

        return NextResponse.json({
            success: true,
            data: result.jobCard,
            message: "Job card created and assigned successfully"
        }, { status: 201 });

    } catch (error: any) {
        console.error("Failed to create job full-chain:", error);
        return NextResponse.json({ error: error.message || "Failed to create job entry" }, { status: 500 });
    }
}
