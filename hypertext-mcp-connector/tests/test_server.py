"""
Unit tests for Hypertext Navigator MCP Server
"""

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server import mcp


def test_set_output_mode_educational():
    """Test setting educational mode."""
    result = mcp.tools["set_output_mode"](mode="educational")

    assert result["mode"] == "educational"
    assert result["active"] is True
    assert "educational" in result["message"].lower()
    assert "guidance" in result
    assert "3-5" in result["expected_hypertext_count"]


def test_set_output_mode_exploratory():
    """Test setting exploratory mode."""
    result = mcp.tools["set_output_mode"](mode="exploratory")

    assert result["mode"] == "exploratory"
    assert result["active"] is True
    assert "5-10" in result["expected_hypertext_count"]


def test_set_output_mode_standard():
    """Test setting standard mode."""
    result = mcp.tools["set_output_mode"](mode="standard")

    assert result["mode"] == "standard"
    assert result["expected_hypertext_count"] == 0


def test_create_hypertext():
    """Test creating hypertext with default display text."""
    result = mcp.tools["create_hypertext"](
        term="quantum computing",
        context="User is learning about computing"
    )

    assert result["term"] == "quantum computing"
    assert result["display_text"] == "quantum computing"
    assert result["context"] == "User is learning about computing"
    assert "initial_content" in result
    assert "_meta" in result
    assert "openai/outputTemplate" in result["_meta"]


def test_create_hypertext_custom_display():
    """Test creating hypertext with custom display text."""
    result = mcp.tools["create_hypertext"](
        term="quantum computing",
        context="Test context",
        display_text="QC"
    )

    assert result["term"] == "quantum computing"
    assert result["display_text"] == "QC"


def test_explore_concept_overview():
    """Test exploring concept at overview depth."""
    result = mcp.tools["explore_concept"](
        concept="neural networks",
        depth="overview"
    )

    assert result["concept"] == "neural networks"
    assert result["depth"] == "overview"
    assert "content" in result
    assert "suggested_followups" in result
    assert len(result["suggested_followups"]) > 0


def test_explore_concept_advanced():
    """Test exploring concept at advanced depth."""
    result = mcp.tools["explore_concept"](
        concept="quantum entanglement",
        depth="advanced"
    )

    assert result["depth"] == "advanced"
    assert "content" in result


def test_get_current_mode():
    """Test getting current mode."""
    # Set a mode first
    mcp.tools["set_output_mode"](mode="educational")

    result = mcp.tools["get_current_mode"]()

    assert result["mode"] == "educational"
    assert "description" in result


def test_mode_persistence():
    """Test that mode persists across tool calls."""
    # Set educational mode
    mcp.tools["set_output_mode"](mode="educational")

    # Create hypertext (should capture current mode)
    result = mcp.tools["create_hypertext"](
        term="test",
        context="test"
    )

    assert result["mode"] == "educational"

    # Switch to exploratory
    mcp.tools["set_output_mode"](mode="exploratory")

    # Create another hypertext
    result2 = mcp.tools["create_hypertext"](
        term="test2",
        context="test2"
    )

    assert result2["mode"] == "exploratory"


def test_tool_list():
    """Test that all expected tools are registered."""
    tool_names = list(mcp.tools.keys())

    expected_tools = [
        "set_output_mode",
        "create_hypertext",
        "explore_concept",
        "get_current_mode"
    ]

    for tool in expected_tools:
        assert tool in tool_names, f"Tool {tool} not found in registered tools"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
