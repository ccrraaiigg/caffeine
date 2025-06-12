#!/usr/bin/env node

import { TextDecoder, TextEncoder } from 'node:util';
import readline from 'node:readline';

const MCP_URL = 'http://localhost:10000/mcp';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const input = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

async function connectMCP() {
  // Create a readable stream from stdin
  const requestStream = new ReadableStream({
    start(controller) {
      input.on('line', (line) => {
        if (line.trim()) {
          controller.enqueue(encoder.encode(line + '\n'));
        }
      });

      input.on('close', () => {
        controller.close();
      });
    },
  });

  const response = await fetch(MCP_URL, {
    method: 'POST',
    body: requestStream,
    headers: {
      'Content-Type': 'application/json',
    },
    duplex: 'half'
  });

  if (!response.ok) {
    console.error('MCP HTTP error:', response.status);
    process.exit(1);
  }

  console.log('body: ' + response.body)
  
  const reader = response.body.getReader();
  let buf = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);

      if (line) {
        process.stdout.write(line + '\n');
      }
    }
  }

  process.exit(0);
}

connectMCP().catch((err) => {
  console.error('Fatal MCP bridge error:', err);
  process.exit(1);
});
