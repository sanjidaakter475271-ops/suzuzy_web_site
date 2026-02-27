import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { broadcast } from "@/lib/socket-server";

export async function GET(req: NextRequest) {
    try {
        // This endpoint should be protected by a secure header or only internal access
        const activeRules = await prisma.escalation_rules.findMany({
            where: {
                is_active: true,
                trigger_type: 'time_breach'
            }
        });

        const escalationsFound = [];

        for (const rule of activeRules) {
            const condition = rule.condition as any;
            const thresholdHours = condition.threshold_hours || 4;

            // Find job cards that have been active more than thresholdHours
            const thresholdDate = new Date();
            thresholdDate.setHours(thresholdDate.getHours() - thresholdHours);

            const pastEscalations = await prisma.escalation_history.findMany({
                where: { rule_id: rule.id, entity_type: 'job_card' },
                select: { entity_id: true }
            });
            const escalatedJobIds = pastEscalations.map(e => e.entity_id);

            const breachedJobs = await prisma.job_cards.findMany({
                where: {
                    dealer_id: rule.dealer_id,
                    status: 'in_progress',
                    created_at: { lt: thresholdDate },
                    ...(escalatedJobIds.length > 0 ? { id: { notIn: escalatedJobIds } } : {})
                },
                include: { service_tickets: true }
            });

            for (const job of breachedJobs) {
                const escalation = await prisma.escalation_history.create({
                    data: {
                        dealer_id: rule.dealer_id,
                        rule_id: rule.id,
                        entity_type: 'job_card',
                        entity_id: job.id,
                        level: 1, // Start at level 1
                        reason: `SLA Breach: Job in progress for over ${thresholdHours} hours`,
                        status: 'active'
                    }
                });

                escalationsFound.push(escalation);

                // Broadcast
                await broadcast('job:escalated', {
                    jobId: job.id,
                    jobNo: job.service_tickets?.service_number,
                    reason: escalation.reason,
                    dealerId: rule.dealer_id
                });
            }
        }

        return NextResponse.json({ success: true, count: escalationsFound.length, data: escalationsFound });

    } catch (error: any) {
        console.error("Escalation check error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
