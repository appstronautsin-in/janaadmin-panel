declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      getBounds(): LatLngBounds | undefined;
      addListener(eventName: string, handler: (event: any) => void): MapsEventListener;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng | undefined;
      addListener(eventName: string, handler: () => void): MapsEventListener;
    }

    class LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      draggable?: boolean;
    }

    interface MapsEventListener {}

    interface MapMouseEvent {
      latLng: LatLng | null;
    }

    class LatLngBounds {}

    class Geocoder {
      geocode(
        request: GeocoderRequest,
        callback: (results: GeocoderResult[], status: string) => void
      ): void;
    }

    interface GeocoderRequest {
      location?: LatLng | LatLngLiteral;
      address?: string;
    }

    interface GeocoderResult {
      formatted_address: string;
    }

    namespace places {
      class SearchBox {
        constructor(input: HTMLInputElement);
        setBounds(bounds: LatLngBounds): void;
        getPlaces(): PlaceResult[];
        addListener(eventName: string, handler: () => void): MapsEventListener;
      }

      interface PlaceResult {
        formatted_address?: string;
        name?: string;
        geometry?: {
          location: LatLng;
        };
      }
    }
  }
}

interface Window {
  google: typeof google;
}
