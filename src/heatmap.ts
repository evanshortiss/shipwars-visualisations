import { renderGrid } from './map-render'
import { CellKey, ShotEventData, HitStore, SSE_DATA_INDEXES, RendererInput } from './types'
import { getApiUrl } from './util'

// All hits are stored so the visualisation can be updated over time
// with respect to each cell's individual values
const store: HitStore = {}

// The highest number of shots against a cell. We don't care *which* cell,
// we just need to use this as a reference for colour gradient steps
let maxCellValue = 0

// Should be a value similar to 'http://my-streams-app-host.acme.com/shot-distribution/stream'
// Can be defined at build time as STREAMS_API_URL in the environment, or
// passed as a URL query parameter when loading this application
const url = getApiUrl('/shot-distribution/stream  ').toString()
const connectingEl = document.getElementById('view-connecting')
const visualisationEl = document.getElementById('view-visualisation')
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
  }, 1000)

  source.onerror = (e) => {
    console.log(e)
    reject(new Error('Error connecting to streams API SSE'))
  }
  source.onmessage = (m: MessageEvent<string>) => {
    const parts = m.data.split(':')

    if (parts.length !== 3) {
      throw new Error(`received malformed payload: ${m.data}`)
    }

    processShotEvent({
      hit: parts[SSE_DATA_INDEXES.HIT_MISS] === 'miss',
      attacker: parts[SSE_DATA_INDEXES.PLAYER_TYPE],
      origin: {
        x: parseInt(parts[SSE_DATA_INDEXES.ORIGIN].split(',')[0]),
        y: parseInt(parts[SSE_DATA_INDEXES.ORIGIN].split(',')[1])
      }
    })

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
      statusEl.innerHTML = 'Error occurred during application initialisation. Check the DevToo  ls console for details.'
    }
  })

function processShotEvent(event: ShotEventData) {
  const key: CellKey = `${event.origin.x},${event.origin.y}` as const
  if (!store[key]) {
    store[key] = {
      total: 0,
      hits: 0,
      misses: 0
    }
  }
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

  const args = Object.keys(store).reduce((ret, key) => {
    ret[key] = store[key].total
    return ret
  }, {} as RendererInput)

  renderGrid(args, maxCellValue)
}
