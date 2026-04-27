declare module "leaflet" {
  export type LatLngTuple = [number, number] | [number, number, number];
  export type LatLngExpression = LatLngTuple;
  export type LatLngBoundsExpression = [LatLngExpression, LatLngExpression];

  export interface FitBoundsOptions {
    padding?: [number, number];
    maxZoom?: number;
  }

  export interface MapOptions {
    center?: LatLngExpression;
    zoom?: number;
  }

  export class Map {}
}
