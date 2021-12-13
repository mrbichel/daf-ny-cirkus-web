import type { Dayjs } from 'dayjs';

export type Location = {
    readonly _id: string;
    readonly category: string;
    readonly title: string;
    readonly slug: string;

    readonly location?: {
      lat: number;
      lng: number;
    };

    readonly about?: string;
    readonly address?: string;
    readonly phone?: string;
    readonly mail?: string;
    readonly website?: string;
    readonly instagram?: string;
    readonly facebook?: string;

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

