import {Args} from '@oclif/core';
import {printTable} from '@oclif/table';

import {BaseCommand} from '../../base-command.js';
import type {ApiResponse, Insight} from '../../types.js';

export default class ProjectsInsights extends BaseCommand<typeof ProjectsInsights> {
  static override description = 'List insights for a project';

  static override examples = [
    '<%= config.bin %> projects insights abc-123',
  ];

  static override args = {
    projectId: Args.string({description: 'Project ID', required: true}),
  };

  public async run(): Promise<ApiResponse<Insight[]>> {
    const client = this.getClient();
    const response = await client.get<ApiResponse<Insight[]>>(
      `/public/api/v1/projects/${encodeURIComponent(this.args.projectId)}/insights`,
    );

    if (!this.jsonEnabled()) {
      printTable({
        data: response.data.map((insight) => ({
          Rank: String(insight.rank),
          Title: insight.title,
          Severity: insight.severity,
          Flagged: String(insight.flagged_count),
          Tags: insight.tags.join(', '),
        })),
        columns: ['Rank', 'Title', 'Severity', 'Flagged', 'Tags'],
      });
    }

    return response;
  }
}
