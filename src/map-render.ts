import { CellKey, HitStore, RendererInput } from "./types"

let initialised = false

// Colour gradient steps from light to dark.
// These are the standard Tailwind CSS steps
const BG_COLOUR_STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900
]
const BG_COLOUR = 'blue'
const COLOURS = BG_COLOUR_STEPS.map(depth => `bg-${BG_COLOUR}-${depth}`)
const GRID_SIZE = {
  WIDTH: 5,
  HEIGHT: 5
}

export function clearGrid () {
  for (let i = 0; i < GRID_SIZE.WIDTH; i++) {
    for (let j = 0; j < GRID_SIZE.HEIGHT; j++) {
      const cell = document.getElementById(`${i},${j}`)
      if (cell) {
        cell.className = cell.className.replace(/bg-blue-*.?/, '')
      }
    }
  }
}

export function renderGrid (store: RendererInput, maxCellValue: number) {
  if (!initialised) {
    initialiseGrid()
  }

  Object.keys(store).forEach((key) => {
    const el = document.getElementById(key)
    const shots = store[key]

    if (shots === 0) {
      return
    }

    const stepSize = Math.ceil(maxCellValue / COLOURS.length)
    const colorIdx = Math.min(Math.floor(shots / stepSize), COLOURS.length - 1)

    COLOURS.forEach(c => el?.classList.remove(c))

    el?.classList.add(COLOURS[colorIdx])
  })
}

export function initialiseGrid () {
  if (initialised) {
    return
  }

  initialised = true

  const gridContainerEl = document.getElementById('game-grid')

  if (!gridContainerEl) {
    throw new Error('Failed to find "#game-grid" element in DOM')
  }

  // Create the WIDTH*HEIGHT grid of sqaures
  gridContainerEl.classList.add(
    'grid',
    'grid-flow-col',
    `grid-cols-${GRID_SIZE.WIDTH}`,
    `grid-rows-${GRID_SIZE.HEIGHT}`,
    'gap-4'
  )
  for (let i = 0; i < GRID_SIZE.WIDTH; i++) {
    for (let j = 0; j < GRID_SIZE.HEIGHT; j++) {
      const id: CellKey = `${i},${j}` as const
      const square = document.createElement('div')
      const text = document.createElement('p')

      text.innerHTML = id
      text.classList.add(
        'font-semibold',
        'text-gray-600',
        'bg-white',
        'w-10',
        'h-10',
        'rounded-lg',
        'leading-10'
      )
      square.id = id
      square.appendChild(text)
      square.classList.add(
        'flex',
        'items-center',
        'justify-center',
        'border-2',
        'border-gray-300',
        'text-center',
        'content-center'
      )
      gridContainerEl.appendChild(square)
    }
  }
}
