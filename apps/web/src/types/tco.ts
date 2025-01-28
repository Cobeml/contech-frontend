export interface TCOLocation {
  address: string;
  lat: number;
  lng: number;
  tcoCount: number;
  bin: string;
}

export interface TCOData {
  locations: TCOLocation[];
}
