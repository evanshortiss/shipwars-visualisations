export type CellKey = `${number},${number}`;

export type HitStore = {
  [key: string]: {
    total: number;
    hits: number;
    misses: number;
  }
}

export type RendererInput = {
  [cell: string]: number
}

export enum AGGREGATE_KEYS {
  ai_hit = 'ai_hit',
  ai_miss = 'ai_miss',
  human_hit = 'human_hit',
  human_miss = 'human_miss'
}

export type AggregateResponse = {
  // Game ID
  [game: string]: {
    // Cell coordinate
    [cell: string]: {
      ai_hit: number
      ai_miss: number
      human_hit: number
      human_miss: number
    }
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

export enum SSE_DATA_INDEXES {
  PLAYER_TYPE = 0,
  HIT_MISS = 1,
  ORIGIN = 2,
}
