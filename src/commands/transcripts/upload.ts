import {readFileSync} from 'node:fs';

import {Flags} from '@oclif/core';

import {BaseCommand} from '../../base-command.js';
import type {UploadTranscriptRequest, UploadTranscriptResponse} from '../../types.js';

export default class TranscriptsUpload extends BaseCommand<typeof TranscriptsUpload> {
  static override description = 'Upload a transcript from file or stdin';

  static override examples = [
    '<%= config.bin %> transcripts upload --file transcript.json',
    'cat transcript.json | <%= config.bin %> transcripts upload',
    '<%= config.bin %> transcripts upload --file -',
  ];

  static override flags = {
    file: Flags.string({description: 'Path to JSON file (use - for stdin)'}),
  };

  public async run(): Promise<UploadTranscriptResponse> {
    let input: string;

    if (this.flags.file && this.flags.file !== '-') {
      input = readFileSync(this.flags.file, 'utf8');
    } else if (this.flags.file === '-' || !process.stdin.isTTY) {
      input = readFileSync(0, 'utf8');
    } else {
      this.error(
        'No input provided. Use --file <path> to read from a file, --file - for stdin, or pipe data via stdin.',
        {exit: 1},
      );
    }

    let body: UploadTranscriptRequest;
    try {
      body = JSON.parse(input) as UploadTranscriptRequest;
    } catch {
      this.error('Invalid JSON input. Please provide valid JSON.', {exit: 1});
    }

    if (!body.name || typeof body.name !== 'string') {
      this.error('JSON must contain a "name" field (string).', {exit: 1});
    }

    if (!Array.isArray(body.turns) || body.turns.length === 0) {
      this.error('JSON must contain a non-empty "turns" array.', {exit: 1});
    }

    const client = this.getClient();
    const response = await client.post<UploadTranscriptResponse>(
      '/public/api/v1/halfpipe/transcripts',
      body,
    );

    if (!this.jsonEnabled()) {
      this.log(`Transcript uploaded successfully.`);
      this.log(`ID:     ${response.data.id}`);
      this.log(`Name:   ${response.data.name}`);
      this.log(`Turns:  ${response.data.turnCount}`);
    }

    return response;
  }
}
