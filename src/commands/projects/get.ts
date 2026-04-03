import {Args} from '@oclif/core';

import {BaseCommand} from '../../base-command.js';
import type {ApiResponse, ProjectDetail} from '../../types.js';

export default class ProjectsGet extends BaseCommand<typeof ProjectsGet> {
  static override description = 'Get project details';

  static override examples = [
    '<%= config.bin %> projects get abc-123',
  ];

  static override args = {
    projectId: Args.string({description: 'Project ID', required: true}),
  };

  public async run(): Promise<ApiResponse<ProjectDetail>> {
    const client = this.getClient();
    const response = await client.get<ApiResponse<ProjectDetail>>(
      `/public/api/v1/projects/${encodeURIComponent(this.args.projectId)}`,
    );

    const p = response.data;

    if (!this.jsonEnabled()) {
      this.log(`ID:                 ${p.id}`);
      this.log(`Name:               ${p.name}`);
      this.log(`Transcripts:        ${p.transcript_count}`);
      this.log(`Latest Transcript:  ${p.latest_transcript_at ?? '-'}`);
      this.log(`Created:            ${p.created_at}`);
      this.log('');

      if (p.executive_summary && Object.keys(p.executive_summary).length > 0) {
        this.log('Executive Summary:');
        const formatted = JSON.stringify(p.executive_summary, null, 2);
        for (const line of formatted.split('\n')) {
          this.log(`  ${line}`);
        }
      } else {
        this.log('Executive Summary:');
        this.log('  No report available');
      }
    }

    return response;
  }
}
