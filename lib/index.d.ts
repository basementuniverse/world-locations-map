/// <reference types="react" />
import './index.css';
import './loading-spinner.css';
declare type Location = {
    long: number;
    lat: number;
    label?: string;
    size?: number;
    colour?: string;
};
export declare function WorldLocationsMap({ background, foreground, locations, }: {
    background?: string;
    foreground?: string;
    locations: Location[];
}): JSX.Element;
export {};
