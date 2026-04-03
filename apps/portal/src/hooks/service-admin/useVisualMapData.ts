// apps/portal/src/hooks/service-admin/useVisualMapData.ts

'use client';

import { useMemo } from 'react';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import type { RampData, MapStats, TechnicianOnMap, VehicleOnRamp, RampStatus, TechnicianStatus } from '@/types/service-admin/visualMap';
import type { JobCard, Ramp, Technician } from '@/types/service-admin/workshop';

function deriveRampStatus(ramp: Ramp, jobCards: JobCard[]): RampStatus {
  if (ramp.status === 'maintenance') return 'maintenance';

  const assignedJob = jobCards.find(
    (jc) => jc.assignedRampId === ramp.id && !['completed', 'delivered', 'cancelled', 'paid', 'invoiced'].includes(jc.status)
  );

  if (!assignedJob) return 'free';

  switch (assignedJob.status) {
    case 'created':
    case 'diagnosed':
    case 'estimate_sent':
    case 'customer_approved':
    case 'waiting_parts':
      return 'booked';
    case 'in_progress':
    case 'additional_work':
      return 'active';
    case 'qc_pending':
    case 'qc_approved':
    case 'qc_rejected':
      return 'qc_pending';
    default:
      return 'free';
  }
}

function mapTechnicianStatus(status: Technician['status']): TechnicianStatus {
    switch (status) {
        case 'busy': return 'working';
        case 'active': return 'idle';
        case 'on-leave': return 'absent';
        case 'pending': return 'idle';
        default: return 'idle';
    }
}

function mapTechnician(tech?: Technician): TechnicianOnMap | null {
  if (!tech) return null;
  return {
    id: tech.id,
    name: tech.name,
    avatar: tech.avatar,
    status: mapTechnicianStatus(tech.status),
    currentJobId: null,
  };
}

function mapVehicle(job?: JobCard): VehicleOnRamp | null {
  if (!job) return null;

  // Calculate if urgent (older than 2 hours)
  const isUrgent = job.createdAt ? (Date.now() - new Date(job.createdAt).getTime()) > (120 * 60 * 1000) : false;

  return {
    jobCardId: job.id,
    jobCardNumber: job.jobNo,
    vehicleRegNo: job.vehicleRegNo,
    vehicleName: job.vehicleModel,
    customerName: job.customerName,
    customerPhone: job.customerPhone,
    serviceType: job.serviceType || 'General Service',
    services: job.items.map(i => i.description),
    estimatedCompletion: job.estimatedCompletion,
    priority: isUrgent ? 'urgent' : 'normal',
  };
}

export function useVisualMapData() {
  const { ramps, jobCards, technicians } = useWorkshopStore();

  const rampData: RampData[] = useMemo(() => {
    if (!ramps?.length) return [];

    return ramps.map((ramp, index) => {
      const status = deriveRampStatus(ramp, jobCards);
      const assignedJob = jobCards.find(
        (jc) => jc.assignedRampId === ramp.id && !['completed', 'delivered', 'cancelled', 'paid', 'invoiced'].includes(jc.status)
      );

      const tech = technicians.find(t => t.id === ramp.assignedTechnicianId)
                || (assignedJob?.assignedTechnicianId ? technicians.find(t => t.id === assignedJob.assignedTechnicianId) : undefined);

      const cols = 4;
      return {
        id: ramp.id,
        rampNumber: index + 1,
        rampName: ramp.name,
        status,
        position: {
          row: Math.floor(index / cols),
          col: index % cols,
        },
        technician: mapTechnician(tech),
        vehicle: mapVehicle(assignedJob),
        occupiedSince: ramp.startTime || assignedJob?.createdAt || null,
        bookedSince: assignedJob?.createdAt || null,
        lastActivityAt: assignedJob?.updatedAt || null,
      };
    });
  }, [ramps, jobCards, technicians]);

  const stats: MapStats = useMemo(() => {
    // Pipeline stage filtering
    const qcJobs = jobCards.filter((jc) =>
      ['qc_pending', 'qc_rejected', 'qc_approved'].includes(jc.status) &&
      !['delivered', 'paid', 'cancelled', 'invoiced'].includes(jc.status)
    );

    const financeJobs = jobCards.filter((jc) =>
      ['completed', 'invoiced'].includes(jc.status) &&
      !['paid', 'delivered', 'cancelled'].includes(jc.status)
    );

    const s: MapStats = {
      totalRamps: rampData.length,
      activeRamps: rampData.filter((r) => r.status === 'active').length,
      freeRamps: rampData.filter((r) => r.status === 'free').length,
      bookedRamps: rampData.filter((r) => r.status === 'booked').length,
      qcPendingRamps: qcJobs.length,
      financePendingCount: financeJobs.length,
      qcQueue: qcJobs.map(j => mapVehicle(j)).filter(Boolean) as VehicleOnRamp[],
      financeQueue: financeJobs.map(j => mapVehicle(j)).filter(Boolean) as VehicleOnRamp[],
      onBreakRamps: rampData.filter((r) => r.status === 'on_break').length,
      maintenanceRamps: rampData.filter((r) => r.status === 'maintenance').length,
      totalTechnicians: technicians.length,
      workingTechnicians: technicians.filter((t) => t.status === 'busy').length,
      idleTechnicians: technicians.filter((t) => t.status === 'active' || t.status === 'pending').length,
      onBreakTechnicians: 0,
      absentTechnicians: technicians.filter((t) => t.status === 'on-leave').length,
      avgOccupancyMinutes: 0,
      longestOccupiedRamp: null,
    };

    const occupiedRamps = rampData.filter((r) => r.occupiedSince);
    if (occupiedRamps.length) {
      const now = Date.now();
      let totalMin = 0;
      let longest: RampData | null = null;
      let longestMs = 0;

      occupiedRamps.forEach((r) => {
        const ms = now - new Date(r.occupiedSince!).getTime();
        const min = ms / 60000;
        totalMin += min;
        if (ms > longestMs) {
          longestMs = ms;
          longest = r;
        }
      });

      s.avgOccupancyMinutes = Math.round(totalMin / occupiedRamps.length);
      s.longestOccupiedRamp = longest;
    }

    return s;
  }, [rampData, technicians, jobCards]);

  const unassignedTechnicians: TechnicianOnMap[] = useMemo(() => {
    const assignedTechIds = new Set(
      rampData.filter((r) => r.technician).map((r) => r.technician!.id)
    );
    return technicians
      .filter((t) => !assignedTechIds.has(t.id))
      .map(t => mapTechnician(t))
      .filter(Boolean) as TechnicianOnMap[];
  }, [rampData, technicians]);

  return { rampData, stats, unassignedTechnicians };
}
