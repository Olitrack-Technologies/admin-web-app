import "leaflet"

declare module "leaflet" {
  interface Marker {
    slideTo(
      latlng: LatLngExpression,
      options?: { duration?: number; keepAtCenter?: boolean }
    ): this
  }
}
