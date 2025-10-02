/**
 * Default action buttons for cards
 */

import type { CardButton } from '@/types/button';

export const DEFAULT_BUTTONS: CardButton[] = [
  {
    id: 'learn-more',
    label: 'Learn More',
    icon: '📚',
    prompt: `Based on this content: "{{content}}", provide more information about {{customContext || 'the main topic'}}.

Title: {{title}}

Please provide detailed information, context, and relevant insights.`,
    connectionType: 'references',
    enabled: true,
  },
  {
    id: 'summarize',
    label: 'Summarize',
    icon: '📝',
    prompt: `Summarize the following content, focusing on {{customContext || 'the key points'}}:

Title: {{title}}
Content: {{content}}

Provide a concise summary that captures the essential information.`,
    connectionType: 'generated-from',
    enabled: true,
  },
  {
    id: 'critique',
    label: 'Critique',
    icon: '🔍',
    prompt: `Provide a critical analysis of the following content, specifically examining {{customContext || 'its strengths and weaknesses'}}:

Title: {{title}}
Content: {{content}}

Offer constructive criticism and identify potential improvements.`,
    connectionType: 'related',
    enabled: true,
  },
  {
    id: 'eli5',
    label: 'ELI5',
    icon: '👶',
    prompt: `Explain the following content in simple terms that a 5-year-old would understand, focusing on {{customContext || 'the core concept'}}:

Title: {{title}}
Content: {{content}}

Use simple language, analogies, and examples.`,
    connectionType: 'related',
    enabled: true,
  },
  {
    id: 'expand',
    label: 'Expand',
    icon: '💡',
    prompt: `Expand on the following content with additional details, examples, and insights about {{customContext || 'the main ideas'}}:

Title: {{title}}
Content: {{content}}

Provide deeper analysis and related information.`,
    connectionType: 'references',
    enabled: true,
  },
];
