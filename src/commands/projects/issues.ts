import {Args} from '@oclif/core';
import {printTable} from '@oclif/table';

import {BaseCommand} from '../../base-command.js';
import type {ApiResponse, Issue} from '../../types.js';

export default class ProjectsIssues extends BaseCommand<typeof ProjectsIssues> {
  static override description = 'List issues for a project';

  static override examples = [
    '<%= config.bin %> projects issues abc-123',
  ];

  static override args = {
    projectId: Args.string({description: 'Project ID', required: true}),
  };

  public async run(): Promise<ApiResponse<Issue[]>> {
    const client = this.getClient();
    const response = await client.get<ApiResponse<Issue[]>>(
      `/public/api/v1/projects/${encodeURIComponent(this.args.projectId)}/issues`,
    );

    if (!this.jsonEnabled()) {
      printTable({
        data: response.data.map((issue) => ({
          Rank: String(issue.rank),
          Title: issue.title,
          Severity: issue.severity,
          Flagged: String(issue.flagged_count),
          Tags: issue.tags.join(', '),
        })),
        columns: ['Rank', 'Title', 'Severity', 'Flagged', 'Tags'],
      });
    }

    return response;
  }
}
