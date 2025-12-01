import { ExternalServiceError } from '../../errors/external-service.error'
import { buildDocumentationPrompt } from './prompts'
import { llmResponseSchema, type RepoModel } from './types'

export async function generateDocumentation(
    repoModel: RepoModel,
    apiKey: string
): Promise<string> {
    try {
        const prompt = buildDocumentationPrompt(repoModel)

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a technical documentation expert. Generate comprehensive, beginner-friendly documentation.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 16000,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new ExternalServiceError(`OpenAI API returned ${response.status}`, {
                status: response.status,
                error: errorText,
            })
        }

        const data = await response.json()

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new ExternalServiceError('Invalid response from OpenAI API', {
                data,
            })
        }

        return data.choices[0].message.content
    } catch (error) {
        if (error instanceof ExternalServiceError) {
            throw error
        }
        throw new ExternalServiceError('Failed to generate documentation with LLM', {
            error: error instanceof Error ? error.message : String(error),
        })
    }
}
export function generateStaticDocumentation(model: RepoModel): string {
    const { owner, repo, branch, files, modules, workflows, tests, configs } = model

    return `# ${repo} - Contributor Guide

> **Auto-generated documentation** to help new contributors understand and contribute to this project.  
> Repository: [\`${owner}/${repo}\`](https://github.com/${owner}/${repo})  
> Branch: \`${branch}\`  
> Generated: ${new Date().toLocaleString()}

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Key Directories](#key-directories)
- [Important Files](#important-files)
- [Testing](#testing)
- [Contributing](#contributing)

---

## 🎯 Project Overview

### What is ${repo}?

**${repo}** is a project with ${files.length} files organized across ${modules.length} main modules.

**Repository Stats:**
- 📁 **Total Files:** ${files.length}
- 🧩 **Modules:** ${modules.length}
- 🧪 **Test Files:** ${tests.length}
- ⚙️ **Configuration:** ${configs.length}
- ⚡ **Workflows:** ${workflows.length}

---

## 📂 Repository Structure

\`\`\`
${repo}/
${modules.slice(0, 15).map((dir: string) => `├── ${dir}/`).join('\n')}
${modules.length > 15 ? `└── ... and ${modules.length - 15} more directories` : ''}
\`\`\`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v18 or higher recommended
- **Package Manager:** npm, yarn, or pnpm
- **Git:** For cloning and contributing

### Installation

\`\`\`bash
# 1. Clone the repository
git clone https://github.com/${owner}/${repo}.git

# 2. Navigate to the project
cd ${repo}

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
\`\`\`

---

## 🏗️ Architecture Overview

### Project Type

Based on the repository structure, this appears to be a **${modules.includes('packages') ? 'Monorepo' : 'Standard'
        }** project.

### Architecture Diagram

\`\`\`mermaid
flowchart TD
    A[${repo}] --> B[Source Code]
    A --> C[Tests]
    A --> D[Configuration]
    
    ${modules.includes('src') ? 'B --> E[src/]' : ''}
    ${modules.includes('packages') ? 'B --> F[packages/]' : ''}
    ${tests.length > 0 ? 'C --> G[Test Suites]' : ''}
\`\`\`

---

## 📁 Key Directories

${modules.slice(0, 10).map((dir: string) => `### \`${dir}/\`
- **Module:** ${dir}
`).join('\n')}

---

## 📄 Important Files

### Configuration
${configs.slice(0, 10).map((f: string) => `- [\`${f}\`](${f})`).join('\n')}

### Workflows
${workflows.slice(0, 5).map((f: string) => `- [\`${f}\`](${f})`).join('\n')}

---

## 🧪 Testing

This project includes **${tests.length} test files**.

### Test Files Location
${tests.slice(0, 5).map((f: string) => `- \`${f}\``).join('\n')}

---

## 🤝 Contributing

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature
4. **Make your changes** and commit
5. **Push** to your fork
6. **Open a Pull Request**

---

**Generated by:** Motia Auto-Doc Workflow  
**Repository:** [${owner}/${repo}](https://github.com/${owner}/${repo})

*This guide was automatically generated. If you find any issues, please open an issue!*
`
}
