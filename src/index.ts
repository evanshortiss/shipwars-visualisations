import { CellKey, ShotEvent, ShotEventData, HitStore } from './types'

const GRID_SIZE = {
  WIDTH: 5,
  HEIGHT: 5
}

// All hits are stored so the visualisation can be updated over time
// with respect to each cell's individual values
const store: HitStore = {}

// The highest number of shots against a cell. We don't care *which* cell,
// we just need to use this as a reference for colour gradient steps
let maxCellValue = 0

// Colour gradient steps from light to dark.
// These are the standard Tailwind CSS steps
const BG_COLOUR_STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900
]
const BG_COLOUR = 'blue'
const COLOURS = BG_COLOUR_STEPS.map(depth => `bg-${BG_COLOUR}-${depth}`)

// Should be a value similar to 'http://my-streams-app-host.acme.com/shot-distribution/stream'
// Can be defined at build time as STREAMS_API_URL in the environment, or
// passed as a URL query parameter when loading this application
const url = process.env.STREAMS_API_URL || new URL(window.location.href).searchParams.get('url')

const connectingEl =  document.getElementById('view-connecting')
const visualisationEl =  document.getElementById('view-visualisation')
const gridContainerEl =  document.getElementById('game-grid')
const statusEl = document.getElementById('status')

new Promise<void>((resolve, reject) => {
  if (!url) {
    throw new Error('The STREAMS_API_URL was not defined at build time. Uh oh...')
  }

  console.log('Connecting to Quarkus Kafka Streams application at:', url)

  const source = new EventSource(url)

  source.onopen = () => setTimeout(() => {
    // Use setTimeout here, because we all love a good loading spinner...
    if (statusEl) {
      statusEl.innerHTML = 'Waiting on first payload...'
    }
    initialiseGrid()
  }, 1000)

  source.onerror = reject
  source.onmessage = (m) => {
    const data = JSON.parse(m.data) as ShotEvent
    processShotEvent(data.data)
    resolve()
  }
})
  .then(() => {
    console.log(`Connected to event stream at ${url}!`)

    connectingEl?.classList.add('hidden')
    visualisationEl?.classList.remove('hidden')

  })
  .catch((e) => {
    console.error('An error occurred during application initialisation')
    console.error(e)

    if (statusEl) {
      statusEl.innerHTML = 'Error occurred during application initialisation. Check the DevTools console for details.'
    }
  })

function processShotEvent (event: ShotEventData) {
  const key: CellKey = `${event.origin.x},${event.origin.y}` as const
  const total = ++store[key].total

  if (total >= maxCellValue) {
    // The max cell value needs to be tracked since it's used to determine
    // colour gradient stepping. It's tracked using a global to avoid
    // recomputing it on every payload received
    maxCellValue = total
  }

  if (event.hit) {
    store[key].hits++
  } else {
    store[key].misses++
  }

  // Find the step size for colour gradients. For example, if the square with
  // the most shots against it has a value of 100 (i.e max=100), and
  // COLOUR_STEPS.length is 10, then squares with 5 hits use COLOUR_STEPS[0],
  // since it's between 0-9, squares with 12 hits will use COLOUR_STEPS[1] etc
  const stepSize = Math.ceil(maxCellValue / COLOURS.length)

  Object.keys(store).forEach((key) => {
    const el = document.getElementById(key)
    const shots = store[key].total

    if (shots === 0) {
      return
    }

    const colorIdx = Math.min(Math.floor(shots / stepSize), COLOURS.length - 1)

    COLOURS.forEach(c => el?.classList.remove(c))

    el?.classList.add(COLOURS[colorIdx])
  })
}

function initialiseGrid () {
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

      // Initialise the hit tracking for this cell
      store[id] = {
        total: 0,
        hits: 0,
        misses: 0
      }

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
