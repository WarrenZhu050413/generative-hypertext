/**
 * Mock content generator for simulating AI responses
 * Used in Phase 3 before real Claude backend integration
 */

/**
 * Template responses for common topics
 */
const RESPONSE_TEMPLATES: Record<string, string> = {
  'distributed cognition': `
    <div>
      <h3>Distributed Cognition</h3>
      <p>Distributed cognition is a theoretical framework that views cognitive processes as distributed across individuals, artifacts, and time. Key principles include:</p>
      <ul>
        <li><strong>External Representations:</strong> Cognitive work is offloaded to external artifacts (notes, diagrams, tools)</li>
        <li><strong>Propagation of State:</strong> Information flows between internal and external representations</li>
        <li><strong>Coordination:</strong> Multiple agents (human and artificial) collaborate in cognitive tasks</li>
      </ul>
      <p>In the context of Nabokov's Web, the floating windows and spatial canvas serve as external memory, allowing you to think with the environment rather than just in your head.</p>
      <learn-more topic="external memory">Learn more about external memory</learn-more>
    </div>
  `,
  'external memory': `
    <div>
      <h3>External Memory Systems</h3>
      <p>External memory refers to information stored outside the brain that extends cognitive capabilities. Examples include:</p>
      <ul>
        <li><strong>Writing systems:</strong> Notes, journals, documentation</li>
        <li><strong>Spatial arrangements:</strong> Physical positioning of objects to encode meaning</li>
        <li><strong>Digital systems:</strong> Bookmarks, saved articles, knowledge bases</li>
      </ul>
      <p>Nabokov's Web implements this through persistent floating windows and spatial card layout.</p>
    </div>
  `,
  'default': `
    <div>
      <p>This is a mock AI response. In Phase 5, this will be replaced with real Claude API integration.</p>
      <p>Your question: <strong>{{query}}</strong></p>
      <p>The system would analyze the card content and provide a contextual response based on both your question and the card's information.</p>
    </div>
  `
};

/**
 * Simulates streaming AI response with realistic delays
 */
export class MockContentGenerator {
  /**
   * Generate mock AI response with streaming
   * @param query User's question
   * @param cardContent Content of the card for context
   * @param signal AbortSignal to cancel streaming
   * @returns AsyncGenerator yielding response chunks
   */
  async *generate(
    query: string,
    cardContent: string,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    // Find matching template
    const lowerQuery = query.toLowerCase();
    let template = RESPONSE_TEMPLATES.default;

    for (const [key, value] of Object.entries(RESPONSE_TEMPLATES)) {
      if (lowerQuery.includes(key)) {
        template = value;
        break;
      }
    }

    // Replace placeholders
    const response = template.replace('{{query}}', query);

    // Simulate streaming with chunks
    const words = response.split(' ');

    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) {
        return;
      }

      const chunk = (i === 0 ? '' : ' ') + words[i];
      yield chunk;

      // Simulate network delay (30-80ms per chunk)
      const delay = Math.random() * 50 + 30;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Generate HTML content for learn-more buttons
   * @param topic Topic to generate content for
   * @param parentCardId ID of the parent card
   * @param signal AbortSignal to cancel generation
   * @returns Promise<string> Generated HTML content
   */
  async generateLearnMore(
    topic: string,
    parentCardId: string,
    signal?: AbortSignal
  ): Promise<string> {
    // Simulate ~3s generation time
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (signal?.aborted) {
      throw new Error('Generation cancelled');
    }

    // Use template if available, otherwise generate generic response
    const template = RESPONSE_TEMPLATES[topic.toLowerCase()] || RESPONSE_TEMPLATES.default;
    return template.replace('{{query}}', topic);
  }
}

// Singleton instance
export const mockContentGenerator = new MockContentGenerator();
