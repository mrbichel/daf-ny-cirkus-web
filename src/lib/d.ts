import type { Dayjs } from "dayjs";

interface location {
    readonly _id: number;
    readonly type: string;
    readonly n: string;
    readonly slug: string;

    loc?: {
      coordinates: [number, number];
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
      dist: number;
      loc: { coordinates: [number, number] };
      _id: number;
    };
    [propName: string]: any;
}

