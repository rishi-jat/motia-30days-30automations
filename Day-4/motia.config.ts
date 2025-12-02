import { MotiaConfig } from 'motia'

import * as PickIssue from './steps/issue-explain/pick-issue-api.step'
import * as FetchIssues from './steps/issue-explain/fetch-issues.step'
import * as FetchIssueDetails from './steps/issue-explain/fetch-issue-details.step'
import * as ScanRepo from './steps/issue-explain/scan-repo.step'
import * as AnalyzeIssue from './steps/issue-explain/analyze-issue.step'
import * as GenerateFixGuide from './steps/issue-explain/generate-fix-guide.step'
import * as WriteFixGuide from './steps/issue-explain/write-fix-guide.step'

const config: MotiaConfig = {
    flows: {
        'issue-explain': {
            name: 'Issue Explainer',
            description: 'Analyzes a GitHub issue and generates a fix guide',
            steps: [
                'PickIssue',
                'FetchIssues',
                'FetchIssueDetails',
                'ScanRepo',
                'AnalyzeIssue',
                'GenerateFixGuide',
                'WriteFixGuide',
            ],
        },
    },
    steps: {
        PickIssue: PickIssue,
        FetchIssues: FetchIssues,
        FetchIssueDetails: FetchIssueDetails,
        ScanRepo: ScanRepo,
        AnalyzeIssue: AnalyzeIssue,
        GenerateFixGuide: GenerateFixGuide,
        WriteFixGuide: WriteFixGuide,
    },
}

export default config
