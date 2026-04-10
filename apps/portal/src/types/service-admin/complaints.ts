export interface GlobalComplaint {
    id: string;
    subject: string;
    status: string;
    priority: string;
    customerName: string;
    customerPhone: string;
    createdAt: string;
}

export interface GlobalRating {
    id: string;
    rating: number;
    comment: string;
    staffRating: number;
    timingRating: number;
    customerName: string;
    customerPhone: string;
    ticketNumber?: string;
    vehicleName?: string;
    createdAt: string;
}

export interface ComplaintsData {
    complaints: GlobalComplaint[];
    ratings: GlobalRating[];
}
