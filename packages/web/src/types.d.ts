import type { Dayjs } from 'dayjs';

export type Location = {
    readonly _id: number;
    readonly type: string;
    readonly n: string;
    readonly slug: string;

    location?: {
      lat: number;
      lng: number;
    };

    readonly about?: string;
    readonly address?: string;
    readonly phone?: string;
    readonly mail?: string;
    readonly web?: string;
    readonly ig?: string;
    readonly fb?: string;

    //lastFetched?: Date;
    lastFetchedDetail?: Dayjs;

    expand?: boolean;
    closestNeighbour?: {
      distance: number;
      location: { 
        lat: number;
        lng: number;
      };
      _id: number;
    };
    //[propName: string]: any;
};

