export type CellKey = `${number},${number}`;

export type HitStore = {
  [key: string]: {
    total: number;
    hits: number;
    misses: number;
  }
}

export type ShotEventData = {
  attacker: string
  hit: boolean
  origin: { x: number, y: number }
}

export type ShotEvent = {
  data: ShotEventData
}
