import {Args, Flags} from '@oclif/core';
import {printTable} from '@oclif/table';

import {BaseCommand} from '../../base-command.js';
import type {ApiPaginatedResponse, TranscriptSummary} from '../../types.js';

export default class ProjectsTranscripts extends BaseCommand<typeof ProjectsTranscripts> {
  static override description = 'List transcripts in a project with filters';

  static override examples = [
    '<%= config.bin %> projects transcripts abc-123',
    '<%= config.bin %> projects transcripts abc-123 --q "refund" --language en',
  ];

  static override args = {
    projectId: Args.string({description: 'Project ID', required: true}),
  };

  static override flags = {
    page: Flags.integer({default: 1, description: 'Page number'}),
    limit: Flags.integer({default: 20, description: 'Results per page'}),
    q: Flags.string({description: 'Search query'}),
    'model-name': Flags.string({description: 'Filter by model name'}),
    language: Flags.string({description: 'Filter by language'}),
    'source-system': Flags.string({description: 'Filter by source system'}),
    annotation: Flags.string({description: 'Filter by annotation (format: "key" or "key:value")'}),
    'date-from': Flags.string({description: 'Filter from date (ISO format)'}),
    'date-to': Flags.string({description: 'Filter to date (ISO format)'}),
  };

  public async run(): Promise<ApiPaginatedResponse<TranscriptSummary>> {
    const client = this.getClient();
    const response = await client.get<ApiPaginatedResponse<TranscriptSummary>>(
      `/public/api/v1/projects/${encodeURIComponent(this.args.projectId)}/transcripts`,
      {
        page: String(this.flags.page),
        limit: String(this.flags.limit),
        q: this.flags.q,
        model_name: this.flags['model-name'],
        language: this.flags.language,
        source_system: this.flags['source-system'],
        annotation: this.flags.annotation,
        date_from: this.flags['date-from'],
        date_to: this.flags['date-to'],
      },
    );

    if (!this.jsonEnabled()) {
      printTable({
        data: response.data.map((t) => ({
          ID: t.id,
          Name: t.name,
          Model: t.model_name ?? '-',
          Language: t.language ?? '-',
          Source: t.source_system ?? '-',
          Turns: String(t.turn_count),
          Created: new Date(t.created_at).toLocaleString(),
        })),
        columns: ['ID', 'Name', 'Model', 'Language', 'Source', 'Turns', 'Created'],
      });

      const totalPages = Math.ceil(response.pagination.total / response.pagination.limit);
      this.log(`\nPage ${response.pagination.page} of ${totalPages} (${response.pagination.total} total)`);
    }

    return response;
  }
}
