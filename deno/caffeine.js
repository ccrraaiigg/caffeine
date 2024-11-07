import {readerFromStreamReader} from 'https://deno.land/std/io/mod.ts'
import {existsSync} from 'https://deno.land/std/fs/mod.ts'

let home = Deno.env.get("HOME"),
    caffeineFolder = home + '/.caffeine',
    // urlBase = 'https://caffeine.js.org'
    urlBase = 'http://192.168.1.66:8080'

async function runCommand(command) {
  const process = Deno.run({
                    cmd: ['bash'],
                    stdout: 'piped',
                    stdin: 'piped'}),
 	encoder = new TextEncoder(),
	decoder = new TextDecoder()

  await process.stdin.write(encoder.encode(command))
  await process.stdin.close()
  const output = await process.output()
  process.close()
  console.log(decoder.decode(output))}

async function downloadAndUnzip(url) {
  console.log('downloading and unzipping ' + url + '...')
  let zipfilepath = caffeineFolder + '/temp.zip'

  const response = await fetch(url)
  const streamReader = response.body?.getReader()

  if (streamReader) {
    const reader = readerFromStreamReader(streamReader)

    const file = await Deno.open(
      zipfilepath,
      {
	create: true,
	write: true})
  
    await Deno.copy(reader, file)
    file.close()}

  const unzip = Deno.run({
                  cmd: [
                    'unzip',
                    zipfilepath,
                    '-d',
                    caffeineFolder]})
  
  const status = await unzip.status()
  Deno.run({cmd: ['rm', zipfilepath]})}

if (!(existsSync(home + '/.deno'))) {
  console.log('installing Deno...')
  runCommand('curl -fsSL https://deno.land/install.sh | sh')}

if (!(existsSync(caffeineFolder))) {
  console.log('installing Caffeine...')
  runCommand('mkdir ' + caffeineFolder)
  await downloadAndUnzip('https://files.squeak.org/4.6/Squeak-4.6-All-in-One.zip')
  // await downloadAndUnzip('https://caffeine.js.org/memories/caffeine.zip')
  await downloadAndUnzip(urlBase + '/memories/caffeine.zip')
  await downloadAndUnzip(urlBase + '/sources/SqueakV46.sources.zip')
  await downloadAndUnzip('http://blackpagedigital.com/caffeine.zip')}

// We don't use runCommand here, because we only want to wait for the
// process to start, not to finish.
let p = Deno.run({cmd: [
  Deno.env.get("HOME") + '/.deno/bin/deno',
  'run',
// '--inspect-brk',
  '--allow-env',
  '--allow-read',
  '--allow-write',
  '--allow-net',
  '--allow-run',
  caffeineFolder + '/bridge.ts']}) 

await p.status()
