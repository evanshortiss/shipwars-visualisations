import { clearGrid, initialiseGrid, renderGrid } from "./map-render";
import { AggregateResponse, AGGREGATE_KEYS, RendererInput } from "./types";
import { getApiUrl } from "./util";

const form = document.forms[0]
const url = getApiUrl('/shot-distribution/')

initialiseGrid()

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const keys: AGGREGATE_KEYS[] = []

  Array.from(form.elements).forEach((el) => {
    const _el = el as HTMLInputElement

    if (_el.checked) {
      keys.push(_el.value as AGGREGATE_KEYS)
    }
  })
  console.log(keys)
  updateGrid(keys)

  return false
});

async function fetchData (): Promise<AggregateResponse> {
  const response = await fetch(url.toString())
  const json: AggregateResponse = await response.json()

  return json
}

async function updateGrid (keys: AGGREGATE_KEYS[]) {
  let json!: AggregateResponse

  try {
    json = await fetchData()
  } catch (e) {
    alert("Failed to fetch aggregate data from the backend.")
    console.error(e)
  }

  if (!json) {
    return
  }

  const game = Object.keys(json)[0]

  if (game) {
    let maxCellValue = 0;
    const args: RendererInput = Object.keys(json[game]).reduce((ret, cell) => {
      const data = json[game][cell]

      // Initialise with a value of zero
      ret[cell] = 0

      // Sum the selected keys
      keys.forEach(k => ret[cell] +=data[k])

      if (ret[cell] > maxCellValue) {
        maxCellValue = ret[cell]
      }

      return ret;
    }, {} as RendererInput)

    clearGrid()
    renderGrid(args, maxCellValue)
  }
}
