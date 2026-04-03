import {Flags} from '@oclif/core';
import {printTable} from '@oclif/table';

import {BaseCommand} from '../../base-command.js';
import type {ApiPaginatedResponse, ProjectSummary} from '../../types.js';

export default class ProjectsList extends BaseCommand<typeof ProjectsList> {
  static override description = 'List projects with pagination';

  static override examples = [
    '<%= config.bin %> projects list',
    '<%= config.bin %> projects list --page 2 --limit 10',
  ];

  static override flags = {
    page: Flags.integer({default: 1, description: 'Page number'}),
    limit: Flags.integer({default: 20, description: 'Results per page'}),
  };

  public async run(): Promise<ApiPaginatedResponse<ProjectSummary>> {
    const client = this.getClient();
    const response = await client.get<ApiPaginatedResponse<ProjectSummary>>(
      '/public/api/v1/projects',
      {
        page: String(this.flags.page),
        limit: String(this.flags.limit),
      },
    );

    if (!this.jsonEnabled()) {
      printTable({
        data: response.data.map((p) => ({
          ID: p.id,
          Name: p.name,
          Transcripts: String(p.transcript_count),
          'Latest Transcript': p.latest_transcript_at ? new Date(p.latest_transcript_at).toLocaleString() : '-',
          Created: new Date(p.created_at).toLocaleString(),
        })),
        columns: ['ID', 'Name', 'Transcripts', 'Latest Transcript', 'Created'],
      });

      const totalPages = Math.ceil(response.pagination.total / response.pagination.limit);
      this.log(`\nPage ${response.pagination.page} of ${totalPages} (${response.pagination.total} total)`);
    }

    return response;
  }
}
