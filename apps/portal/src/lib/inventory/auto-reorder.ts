import { prisma } from "@/lib/prisma/client";
import { broadcast } from "@/lib/socket-server";

export async function checkStockAndAutoReorder(variantId: string) {
    if (!variantId) return;

    try {
        const variant = await prisma.part_variants.findUnique({
            where: { id: variantId },
            include: {
                parts: true
            }
        });

        if (!variant) return;

        const threshold = 5; // Default threshold
        const currentStock = variant.stock_quantity || 0;

        if (currentStock <= threshold) {
            console.log(`[INVENTORY] Low stock detected for ${variant.parts?.name} (${variant.sku}): ${currentStock}`);

            // 1. Create a notification for the dealer
            // We need to find the dealer. Since variant doesn't have dealer_id directly, 
            // we might need to link it via parts or another relation.
            // Assuming for now we broadcast to all admins or a specific dealer if we can find it.

            await broadcast('inventory:low_stock', {
                variantId,
                sku: variant.sku,
                partName: variant.parts?.name,
                currentStock,
                threshold
            });

            // 2. Implementation of auto-reorder (e.g. creating a draft Purchase Order)
            // This would normally involve complex logic (supplier selection, etc.)
            // For MVP, we just log and notify.
        }
    } catch (error) {
        console.error("Auto-reorder check failed:", error);
    }
}
