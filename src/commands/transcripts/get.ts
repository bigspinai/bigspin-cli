import {Args} from '@oclif/core';

import {BaseCommand} from '../../base-command.js';
import type {ApiResponse, TranscriptDetail} from '../../types.js';

export default class TranscriptsGet extends BaseCommand<typeof TranscriptsGet> {
  static override description = 'Get transcript detail with conversation turns';

  static override examples = [
    '<%= config.bin %> transcripts get abc-123',
  ];

  static override args = {
    transcriptId: Args.string({description: 'Transcript ID', required: true}),
  };

  public async run(): Promise<ApiResponse<TranscriptDetail>> {
    const client = this.getClient();
    const response = await client.get<ApiResponse<TranscriptDetail>>(
      `/public/api/v1/transcripts/${encodeURIComponent(this.args.transcriptId)}`,
    );

    const t = response.data;

    if (!this.jsonEnabled()) {
      this.log(`ID:          ${t.id}`);
      this.log(`Name:        ${t.name}`);
      this.log(`Model:       ${t.model_name ?? '-'}`);
      this.log(`Language:    ${t.language ?? '-'}`);
      this.log(`Turns:       ${t.turn_count}`);
      this.log(`Created:     ${t.created_at}`);
      this.log('');
      this.log('--- Turns ---');

      for (const turn of t.turns) {
        this.log('');
        if (turn.tool_calls && turn.tool_calls.length > 0) {
          for (const call of turn.tool_calls) {
            this.log(`[${turn.role}] ${call.name}(${JSON.stringify(call.args)})`);
          }
        } else {
          this.log(`[${turn.role}] ${turn.content}`);
        }
      }
    }

    return response;
  }
}
