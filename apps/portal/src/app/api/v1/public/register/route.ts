import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { z } from "zod";
import crypto from "crypto";

const registrationSchema = z.object({
    qrSecret: z.string(),
    customer: z.object({
        name: z.string().min(2),
        phone: z.string().min(10),
        email: z.string().email().optional().or(z.literal('')),
        password: z.string().min(6),
        nid: z.string().optional(),
        profession: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.string().optional(),
    }),
    address: z.object({
        division: z.string().optional(),
        district: z.string().optional(),
        thana: z.string().optional(),
        postOffice: z.string().optional(),
        village: z.string().optional(),
        houseRoad: z.string().optional(),
    }),
    vehicle: z.object({
        modelId: z.string().uuid(),
        engineNumber: z.string().min(5),
        chassisNumber: z.string().min(5),
        regNo: z.string().optional(),
        color: z.string().optional(),
        dateOfPurchase: z.string().optional(),
        purchaseFrom: z.string().optional(),
    })
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = registrationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                error: "Invalid input data",
                details: validation.error.format()
            }, { status: 400 });
        }

        const data = validation.data;

        // 1. Validate QR Code and get dealer
        const qrRecord = await (prisma as any).customer_registration_qr.findFirst({
            where: { qr_secret: data.qrSecret, is_active: true }
        });

        if (!qrRecord) {
            return NextResponse.json({ success: false, error: "Invalid or expired registration link" }, { status: 400 });
        }

        const dealerId = qrRecord.dealer_id;

        // 2. Check if user already exists (by phone or email)
        const existingByPhone = await prisma.profiles.findUnique({
            where: { phone: data.customer.phone }
        });

        if (existingByPhone) {
            return NextResponse.json({ success: false, error: "A user with this phone number already exists" }, { status: 400 });
        }

        if (data.customer.email) {
            const existingByEmail = await prisma.profiles.findUnique({
                where: { email: data.customer.email }
            });
            if (existingByEmail) {
                return NextResponse.json({ success: false, error: "A user with this email address already exists" }, { status: 400 });
            }
        }

        // 3. Password strength
        const pwdVal = validatePasswordStrength(data.customer.password);
        if (!pwdVal.valid) {
            return NextResponse.json({ success: false, error: pwdVal.message }, { status: 400 });
        }

        // 4. Hash password
        const hashedPassword = await hashPassword(data.customer.password);

        // 5. Get Role
        const role = await prisma.roles.findUnique({
            where: { name: 'customer' }
        });

        if (!role) {
            return NextResponse.json({ success: false, error: "System error: Customer role not configured" }, { status: 500 });
        }

        // 6. Execute registration in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            // Create Profile
            const profile = await tx.profiles.create({
                data: {
                    id: crypto.randomUUID(),
                    email: data.customer.email || null,
                    phone: data.customer.phone,
                    full_name: data.customer.name,
                    password_hash: hashedPassword,
                    role_id: role.id,
                    role: 'customer',
                    dealer_id: dealerId,
                    status: 'active',
                }
            });

            // Create Vehicle (storing address info here as per schema design)
            const vehicle = await tx.service_vehicles.create({
                data: {
                    customer_id: profile.id,
                    model_id: data.vehicle.modelId,
                    engine_number: data.vehicle.engineNumber,
                    chassis_number: data.vehicle.chassisNumber,
                    reg_no: data.vehicle.regNo || null,
                    phone_number: data.customer.phone,
                    customer_name: data.customer.name,
                    color: data.vehicle.color || null,
                    email: data.customer.email || null,
                    customer_nid: data.customer.nid || null,
                    profession: data.customer.profession || null,
                    date_of_birth: data.customer.dateOfBirth ? new Date(data.customer.dateOfBirth) : null,
                    gender: data.customer.gender || null,
                    date_of_purchase: data.vehicle.dateOfPurchase ? new Date(data.vehicle.dateOfPurchase) : null,
                    purchase_from: data.vehicle.purchaseFrom || null,
                    division: data.address.division || null,
                    district_city: data.address.district || null,
                    thana_upozilla: data.address.thana || null,
                    post_office: data.address.postOffice || null,
                    village_mahalla_para: data.address.village || null,
                    house_road_no: data.address.houseRoad || null,
                }
            });

            // Create present address in customer_addresses
            await tx.customer_addresses.create({
                data: {
                    user_id: profile.id,
                    name: "Present Address",
                    phone: data.customer.phone,
                    address_line1: data.address.houseRoad || data.address.village || "N/A",
                    city: data.address.district || "N/A",
                    district: data.address.district || "N/A",
                    division: data.address.division || "N/A",
                    postal_code: data.address.postOffice || "N/A",
                    is_default: true
                }
            });

            // Create Service Plan (default 5 free services)
            await tx.customer_service_plans.create({
                data: {
                    customer_id: profile.id,
                    vehicle_id: vehicle.id,
                    dealer_id: dealerId,
                    total_free_services: 5,
                    used_free_services: 0,
                    plan_type: 'purchase',
                    is_active: true
                }
            });

            return { profile, vehicle };
        });

        return NextResponse.json({
            success: true,
            message: "Registration successful!",
            data: {
                customerId: result.profile.id,
                vehicleId: result.vehicle.id
            }
        });

    } catch (error: any) {
        console.error('[PUBLIC_REGISTER_API] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
