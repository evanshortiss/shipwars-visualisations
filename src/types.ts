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
  game: string
  hit: boolean
  match: string
  origin: { x: number, y: number }
  scoreDelta: number
}

export type ShotEvent = {
  data: ShotEventData
}
