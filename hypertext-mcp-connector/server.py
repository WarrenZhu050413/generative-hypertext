"""
Hypertext Navigator - ChatGPT MCP Connector
Enables educational and exploratory output modes with interactive hypertext tooltips
"""

from fastmcp import FastMCP
from typing import Literal, Optional
import requests
import json
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastMCP server
mcp = FastMCP(
    "Hypertext Navigator",
    description="Interactive hypertext exploration with educational and exploratory modes"
)

# Configuration from environment
BACKEND_URL = os.getenv('HYPERTEXT_BACKEND_URL', 'http://localhost:3100')
COMPONENT_URL = os.getenv('COMPONENT_CDN_URL', 'http://localhost:8080/hypertext-tooltip.html')

# Global state for current mode
current_mode = "standard"


@mcp.tool
def set_output_mode(
    mode: Literal["standard", "educational", "exploratory"]
) -> dict:
    """Control ChatGPT's output style for enhanced learning and exploration.

    This tool fundamentally changes how ChatGPT structures its responses:

    - standard: Regular ChatGPT responses without special formatting
    - educational: Learning-focused with 3-5 hypertext links on key concepts
    - exploratory: Research-oriented with 5-10 hypertext links for deep investigation

    When a mode is active, ChatGPT will automatically create interactive hypertext
    links that users can hover to continue exploring inline.

    Args:
        mode: The output mode to activate

    Returns:
        Confirmation message and detailed instructions for ChatGPT to follow
    """
    global current_mode
    current_mode = mode

    logger.info(f"Output mode changed to: {mode}")

    # Detailed instructions that ChatGPT incorporates into its reasoning
    mode_instructions = {
        "standard": {
            "style": "default",
            "guidance": "Respond normally without special formatting or hypertext links.",
            "hypertext_count": 0
        },
        "educational": {
            "style": "learning-focused",
            "guidance": """You are in EDUCATIONAL MODE. Structure responses for optimal learning:

1. Start with a clear, accessible explanation building from fundamentals
2. Use examples and analogies to illustrate concepts
3. After your explanation, identify 3-5 key terms that deserve deeper exploration
4. For each key term, call create_hypertext(term, context, display_text)
5. Present hypertext links as a "Explore deeper" section
6. Encourage curiosity and questions

Your goal is to teach effectively while enabling self-directed exploration.""",
            "hypertext_count": "3-5"
        },
        "exploratory": {
            "style": "research-oriented",
            "guidance": """You are in EXPLORATORY MODE. Enable deep research:

1. Provide a comprehensive overview of the topic
2. Identify 5-10 branching concepts worth investigating
3. Organize branches by category (fundamentals, applications, methods, open questions)
4. For each branch, call create_hypertext(term, context, display_text)
5. Include methodological considerations and research directions
6. Present as a knowledge graph with multiple entry points

Your goal is to map the intellectual landscape and enable systematic exploration.""",
            "hypertext_count": "5-10"
        }
    }

    instructions = mode_instructions[mode]

    return {
        "mode": mode,
        "active": True,
        "style": instructions["style"],
        "guidance": instructions["guidance"],
        "expected_hypertext_count": instructions["hypertext_count"],
        "message": f"✓ Output mode set to: {mode.upper()}"
    }


@mcp.tool
def create_hypertext(
    term: str,
    context: str,
    display_text: Optional[str] = None
) -> dict:
    """Create an interactive hypertext link with inline tooltip chat.

    This tool embeds an interactive component in ChatGPT's response. When users
    hover the hypertext link, a tooltip appears with an initial explanation and
    the ability to continue the conversation inline.

    Args:
        term: The concept to make interactive (e.g., "quantum entanglement")
        context: Surrounding context from the main conversation for personalized responses
        display_text: Optional custom display text (defaults to term)

    Returns:
        Component metadata for ChatGPT to render as an interactive element

    Example:
        create_hypertext(
            term="neural networks",
            context="User is learning about machine learning basics",
            display_text="neural networks"
        )
    """
    if display_text is None:
        display_text = term

    logger.info(f"Creating hypertext for: {term}")

    # Generate initial tooltip content
    try:
        initial_content = generate_explanation(term, context)
    except Exception as e:
        logger.error(f"Error generating explanation: {e}")
        initial_content = f"Learn more about {term}..."

    return {
        "term": term,
        "display_text": display_text,
        "context": context,
        "initial_content": initial_content,
        "mode": current_mode,
        "_meta": {
            "openai/outputTemplate": {
                "type": "text/html+skybridge",
                "url": COMPONENT_URL
            },
            "openai/widgetAccessible": True,
            "openai/widgetPrefersBorder": False,
            "openai/widgetMinHeight": 200,
            "openai/widgetMaxHeight": 600
        }
    }


@mcp.tool
def explore_concept(
    concept: str,
    depth: Literal["overview", "intermediate", "advanced"] = "overview",
    previous_messages: Optional[str] = None
) -> dict:
    """Deep dive into a concept with contextual understanding.

    This tool is called by the tooltip component when users continue the conversation.
    It provides detailed explanations tailored to the requested depth level.

    Args:
        concept: The concept to explore in depth
        depth: Level of detail (overview, intermediate, advanced)
        previous_messages: JSON string of previous conversation for context

    Returns:
        Detailed explanation with suggested follow-up questions
    """
    logger.info(f"Exploring concept: {concept} at depth: {depth}")

    # Parse previous messages if provided
    conversation_context = []
    if previous_messages:
        try:
            conversation_context = json.loads(previous_messages)
        except json.JSONDecodeError:
            logger.warning("Could not parse previous messages")

    # Generate detailed response
    try:
        content = generate_detailed_explanation(concept, depth, conversation_context)
        followups = generate_followup_questions(concept, depth)
    except Exception as e:
        logger.error(f"Error exploring concept: {e}")
        content = f"I'd be happy to explain more about {concept}. Could you ask a specific question?"
        followups = [
            f"What are the key principles of {concept}?",
            f"How is {concept} used in practice?",
            f"What are common misconceptions about {concept}?"
        ]

    return {
        "concept": concept,
        "depth": depth,
        "content": content,
        "suggested_followups": followups,
        "conversation_length": len(conversation_context)
    }


@mcp.tool
def get_current_mode() -> dict:
    """Get the currently active output mode.

    Returns:
        Information about the current mode and its settings
    """
    return {
        "mode": current_mode,
        "description": {
            "standard": "Regular responses without hypertext",
            "educational": "Learning-focused with 3-5 concept links",
            "exploratory": "Research-oriented with 5-10 deep-dive branches"
        }[current_mode]
    }


# Helper functions

def generate_explanation(term: str, context: str) -> str:
    """Generate initial tooltip content for a term.

    Args:
        term: The concept to explain
        context: Context from the main conversation

    Returns:
        2-3 sentence explanation
    """
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/stream",
            json={
                "messages": [
                    {
                        "role": "system",
                        "content": f"You are explaining '{term}' concisely. Context: {context}. Provide a clear 2-3 sentence explanation suitable for an inline tooltip."
                    },
                    {
                        "role": "user",
                        "content": f"Explain {term} briefly."
                    }
                ]
            },
            stream=True,
            timeout=10
        )

        # Collect streamed response
        content = ""
        for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
            if chunk:
                content += chunk

        return content.strip()

    except requests.RequestException as e:
        logger.error(f"Backend request failed: {e}")
        # Fallback to simple explanation
        return f"{term}: A key concept worth exploring. Ask me anything about it!"


def generate_detailed_explanation(
    concept: str,
    depth: str,
    conversation_context: list
) -> str:
    """Generate detailed explanation for tooltip conversation.

    Args:
        concept: The concept to explain in detail
        depth: Level of detail requested
        conversation_context: Previous messages in the tooltip

    Returns:
        Detailed explanation tailored to depth level
    """
    depth_prompts = {
        "overview": "Provide a clear, accessible explanation suitable for beginners. Use examples.",
        "intermediate": "Provide a detailed explanation with technical depth. Include practical applications and examples.",
        "advanced": "Provide an in-depth technical analysis. Cover edge cases, research directions, and theoretical foundations."
    }

    # Build message history
    messages = [
        {
            "role": "system",
            "content": f"{depth_prompts[depth]} Topic: {concept}"
        }
    ]

    # Add previous conversation
    for msg in conversation_context[-5:]:  # Last 5 messages for context
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })

    try:
        response = requests.post(
            f"{BACKEND_URL}/api/stream",
            json={"messages": messages},
            stream=True,
            timeout=15
        )

        content = ""
        for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
            if chunk:
                content += chunk

        return content.strip()

    except requests.RequestException as e:
        logger.error(f"Backend request failed: {e}")
        return f"I'd be happy to discuss {concept} further. What specific aspect would you like to explore?"


def generate_followup_questions(concept: str, depth: str) -> list[str]:
    """Generate suggested follow-up questions.

    Args:
        concept: The concept being explored
        depth: Current depth level

    Returns:
        List of 3-4 suggested questions
    """
    # These could be generated by LLM, but using templates for reliability
    templates = {
        "overview": [
            f"How does {concept} work in practice?",
            f"What are common applications of {concept}?",
            f"How does {concept} relate to other concepts?"
        ],
        "intermediate": [
            f"What are the technical details of {concept}?",
            f"What are best practices for {concept}?",
            f"What challenges arise when working with {concept}?"
        ],
        "advanced": [
            f"What are the theoretical foundations of {concept}?",
            f"What are current research directions in {concept}?",
            f"What are the limitations and open problems in {concept}?"
        ]
    }

    return templates.get(depth, templates["overview"])


# System prompts for mode enforcement
@mcp.prompt("educational-mode-system")
def educational_mode_prompt():
    """System prompt that enforces educational mode behavior."""
    return """You are in EDUCATIONAL MODE. Your purpose is to teach effectively.

For every response:
1. Provide clear explanations that build from fundamentals to advanced concepts
2. Use examples, analogies, and clear language
3. After your main explanation, identify 3-5 key terms worth deeper exploration
4. Call create_hypertext(term, context) for each key term
5. Present hypertext links in an "Explore deeper" section
6. Encourage curiosity and questions

Example response structure:
[Your pedagogical explanation with examples]

**Explore deeper:**
• [Term 1] ← interactive tooltip
• [Term 2] ← interactive tooltip
• [Term 3] ← interactive tooltip

Each hypertext link enables inline exploration without breaking conversation flow."""


@mcp.prompt("exploratory-mode-system")
def exploratory_mode_prompt():
    """System prompt that enforces exploratory mode behavior."""
    return """You are in EXPLORATORY MODE. Enable systematic research and deep investigation.

For every response:
1. Provide comprehensive overview of the topic
2. Identify 5-10 branching concepts worth investigating
3. Organize branches by category (fundamentals, methods, applications, open questions)
4. Call create_hypertext(term, context) for each branch
5. Include methodological considerations
6. Suggest research directions and related areas

Example response structure:
[Comprehensive overview]

**Knowledge graph branches:**

*Fundamentals:* [concept 1], [concept 2], [concept 3]
*Methods:* [concept 4], [concept 5]
*Applications:* [concept 6], [concept 7]
*Open questions:* [concept 8], [concept 9], [concept 10]

Each hypertext link is an entry point for deep investigation."""


if __name__ == "__main__":
    logger.info(f"Starting Hypertext Navigator MCP Server")
    logger.info(f"Backend URL: {BACKEND_URL}")
    logger.info(f"Component URL: {COMPONENT_URL}")

    # Run server on port 8000 with HTTP transport
    mcp.run(transport="http", port=8000)
