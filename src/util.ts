
export function getApiUrl (path: string): URL {
  const urlOverride = new URL(window.location.href).searchParams.get('url')

  if (urlOverride) {
    return new URL(path, urlOverride.toString())
  } else if (process.env.STREAMS_API_URL) {
    return new URL(path, process.env.STREAMS_API_URL)
  } else {
    alert('Please provide a URL to the Quarkus Kafka Streams service via STREAMS_API_URL at build time, or a "url" query parameter.')
    throw new Error('Error: STREAMS_API_URL was not defined')
  }
}
