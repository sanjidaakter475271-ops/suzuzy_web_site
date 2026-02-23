import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const [payments, payouts] = await Promise.all([
            prisma.payments.findMany({
                include: {
                    orders: {
                        include: {
                            profiles: {
                                select: {
                                    full_name: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            }),
            prisma.dealer_payouts.findMany({
                include: {
                    dealers: {
                        include: {
                            profiles_dealers_owner_user_idToprofiles: { // Correct relation name for owner profile
                                select: {
                                    full_name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            })
        ]);

        return NextResponse.json({
            payments,
            payouts
        });

    } catch (error: any) {
        console.error("Financial Data Fetch Error:", error);
        return NextResponse.json({ error: "Financial registry retrieval failure" }, { status: 500 });
    }
}
