// apps/portal/src/app/service-admin/(dashboard)/workshop/visual-map/page.tsx

import { WorkshopFloorMap } from '@/components/service-admin/workshop/visual-map/WorkshopFloorMap';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workshop Floor Map — Royal Suzuky',
  description: 'Real-time 2D visual overview of all workshop ramps, technicians, and active jobs.',
};

export default function VisualMapPage() {
  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <WorkshopFloorMap />
    </div>
  );
}
