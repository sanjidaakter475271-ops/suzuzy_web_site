'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ReactFlow,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    NodeProps,
    Background,
    Controls,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { 
    User, Bike, Calendar, Receipt, 
    ChevronDown, ChevronUp, Package, 
    Maximize2, Minimize2, Info,
    ExternalLink, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// --- Types ---

interface TreeNodeData extends Record<string, unknown> {
    label?: string;
    model?: string;
    regNo?: string;
    date?: string;
    totalAmount?: string;
    parts?: any[];
    jobId?: string;
}

// --- Custom Node Components ---

const GlassNode = ({ children, className, selected }: { children: React.ReactNode, className?: string, selected?: boolean }) => (
    <div className={cn(
        "px-4 py-3 rounded-2xl border-2 backdrop-blur-xl transition-all duration-500",
        "bg-black/40 border-white/10 text-white shadow-2xl",
        selected ? "border-brand ring-4 ring-brand/20 scale-105" : "hover:border-white/20",
        className
    )}>
        {children}
    </div>
);

// 1. Technician Node (Root)
const TechnicianNode = ({ data, selected }: NodeProps<Node<TreeNodeData>>) => (
    <GlassNode className="min-w-[200px] border-brand/30" selected={selected}>
        <Handle type="source" position={Position.Bottom} className="!bg-brand" />
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center border border-brand/30">
                <User size={24} className="text-brand" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand opacity-60">Lead Agent</p>
                <h4 className="text-lg font-black uppercase italic tracking-tighter leading-none">{data.label}</h4>
            </div>
        </div>
    </GlassNode>
);

// 2. Customer Node
const CustomerNode = ({ data, selected }: NodeProps<Node<TreeNodeData>>) => (
    <GlassNode className="min-w-[180px] border-emerald-500/20" selected={selected}>
        <Handle type="target" position={Position.Top} className="!bg-emerald-500" />
        <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <User size={18} className="text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/60">Customer</p>
                <h4 className="text-sm font-black uppercase truncate">{data.label}</h4>
            </div>
        </div>
    </GlassNode>
);

// 3. Vehicle Node
const VehicleNode = ({ data, selected }: NodeProps<Node<TreeNodeData>>) => (
    <GlassNode className="min-w-[160px] border-blue-500/20" selected={selected}>
        <Handle type="target" position={Position.Top} className="!bg-blue-500" />
        <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Bike size={16} className="text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-500/60">{data.model}</p>
                <h4 className="text-xs font-black uppercase tabular-nums">{data.regNo}</h4>
            </div>
        </div>
    </GlassNode>
);

// 4. Service Date Node
const ServiceDateNode = ({ data, selected }: NodeProps<Node<TreeNodeData>>) => (
    <GlassNode className="min-w-[140px] border-amber-500/20" selected={selected}>
        <Handle type="target" position={Position.Top} className="!bg-amber-500" />
        <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Calendar size={14} className="text-amber-500" />
            </div>
            <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-amber-500/60">Service Date</p>
                <h4 className="text-xs font-black italic">{data.date}</h4>
            </div>
        </div>
    </GlassNode>
);

// 5. Detail Node (The "Receipt")
const DetailNode = ({ data }: NodeProps<Node<TreeNodeData>>) => (
    <div className="w-[280px] bg-black/60 backdrop-blur-2xl rounded-3xl border-2 border-white/10 p-5 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        <Handle type="target" position={Position.Top} className="!bg-white/20" />
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Receipt size={80} strokeWidth={1} />
        </div>
        
        <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
                <Badge className="bg-brand/20 text-brand border-brand/20 text-[8px] font-black uppercase">Transaction Summary</Badge>
                <span className="text-[10px] font-black tabular-nums text-brand">৳{data.totalAmount}</span>
            </div>

            <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Parts Consumed</p>
                {data.parts && data.parts.length > 0 ? (
                    <div className="space-y-1.5">
                        {data.parts.map((p: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                                <span className="text-white/60 truncate flex-1 mr-2">{p.products?.name}</span>
                                <span className="font-bold text-white/80 shrink-0">x{p.quantity}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[9px] italic text-white/20">No parts used</p>
                )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">ID: {data.jobId?.substring(0,8)}</p>
                <Activity size={12} className="text-emerald-500 animate-pulse" />
            </div>
        </div>
    </div>
);

const nodeTypes = {
    technician: TechnicianNode,
    customer: CustomerNode,
    vehicle: VehicleNode,
    serviceDate: ServiceDateNode,
    details: DetailNode,
};

// --- Layouting Logic ---

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node<TreeNodeData>[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 250, height: 100 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const newNode = {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - 125,
                y: nodeWithPosition.y - 50,
            },
        };

        return newNode;
    });

    return { nodes: newNodes, edges };
};

// --- Main Component ---

interface ServiceTreeProps {
    staffId: string;
}

export const ServiceTree: React.FC<ServiceTreeProps> = ({ staffId }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<TreeNodeData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [loading, setLoading] = useState(true);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const buildTree = (data: any) => {
        const newNodes: Node<TreeNodeData>[] = [];
        const newEdges: Edge[] = [];

        // 1. Technician Node (Root)
        const techNodeId = `tech-${data.id}`;
        newNodes.push({
            id: techNodeId,
            type: 'technician',
            data: { label: data.name },
            position: { x: 0, y: 0 },
        });

        // Track seen customers and vehicles to group them
        const customers: Record<string, any> = {};

        data.job_cards?.forEach((job: any) => {
            const customer = job.service_tickets?.profiles;
            const vehicle = job.service_tickets?.service_vehicles;

            if (customer && !customers[customer.id]) {
                customers[customer.id] = {
                    ...customer,
                    vehicles: {}
                };
            }

            if (customer && vehicle && !customers[customer.id].vehicles[vehicle.id]) {
                customers[customer.id].vehicles[vehicle.id] = {
                    ...vehicle,
                    jobs: []
                };
            }

            if (customer && vehicle) {
                customers[customer.id].vehicles[vehicle.id].jobs.push(job);
            }
        });

        // 2. Build Branches
        Object.values(customers).forEach((cust: any) => {
            const custNodeId = `cust-${cust.id}`;
            newNodes.push({
                id: custNodeId,
                type: 'customer',
                data: { label: cust.full_name },
                position: { x: 0, y: 0 },
            });

            newEdges.push({
                id: `edge-${techNodeId}-${custNodeId}`,
                source: techNodeId,
                target: custNodeId,
                animated: true,
                style: { stroke: '#f97316' },
            });

            Object.values(cust.vehicles).forEach((veh: any) => {
                const vehNodeId = `veh-${veh.id}`;
                newNodes.push({
                    id: vehNodeId,
                    type: 'vehicle',
                    data: { model: veh.bike_models?.name, regNo: veh.engine_number },
                    position: { x: 0, y: 0 },
                });

                newEdges.push({
                    id: `edge-${custNodeId}-${vehNodeId}`,
                    source: custNodeId,
                    target: vehNodeId,
                    style: { stroke: '#10b981', opacity: 0.5 },
                });

                veh.jobs.forEach((job: any) => {
                    const jobNodeId = `job-${job.id}`;
                    newNodes.push({
                        id: jobNodeId,
                        type: 'serviceDate',
                        data: { date: format(new Date(job.created_at), 'MMM dd, yyyy') },
                        position: { x: 0, y: 0 },
                    });

                    newEdges.push({
                        id: `edge-${vehNodeId}-${jobNodeId}`,
                        source: vehNodeId,
                        target: jobNodeId,
                    });

                    // 4. Detail Node
                    const detailNodeId = `detail-${job.id}`;
                    const totalAmount = (job.service_tasks?.reduce((sum: number, t: any) => sum + (Number(t.rate) || 0), 0) || 0) + 
                                       (job.service_requisitions?.reduce((sum: number, r: any) => sum + (Number(r.total_price) || 0), 0) || 0);
                    
                    newNodes.push({
                        id: detailNodeId,
                        type: 'details',
                        data: { 
                            totalAmount: totalAmount.toLocaleString(),
                            parts: job.service_requisitions,
                            jobId: job.id
                        },
                        position: { x: 0, y: 0 },
                    });

                    newEdges.push({
                        id: `edge-${jobNodeId}-${detailNodeId}`,
                        source: jobNodeId,
                        target: detailNodeId,
                        style: { strokeDasharray: '5,5' },
                    });
                });
            });
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch(`/api/v1/workshop/staff/${staffId}/service-tree`);
                const result = await res.json();
                if (result.success) {
                    buildTree(result.data);
                }
            } catch (err) {
                console.error("Failed to load tree data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [staffId]);

    if (loading) return (
        <div className="h-[600px] flex items-center justify-center">
            <Activity className="animate-spin text-brand" size={40} />
            <span className="ml-4 font-black uppercase tracking-widest text-white/40">Synthesizing Tree...</span>
        </div>
    );

    return (
        <div className="h-full min-h-[600px] w-full bg-black/20 relative overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-dot-pattern"
            >
                <Background color="#333" gap={20} />
                <Controls className="bg-black/60 border-white/10 text-white fill-white" />
                <Panel position="top-right">
                    <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                        <Info size={16} className="text-brand" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60 text-nowrap mr-8">Interactive Operations Map</span>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
};
