#!/usr/bin/env python3
"""
Test script for MCP Server Finder functionality
This script tests the MCP search agent without requiring the full web application.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from services.llm_service import LLMService, search_mcp_servers, search_web
from config import settings

async def test_mcp_search_tool():
    """Test the MCP search tool directly."""
    print("🔍 Testing MCP Search Tool...")
    print("=" * 50)
    
    # Test queries
    test_queries = [
        "file system operations",
        "database tools",
        "web scraping",
        "API integration",
        "GitHub repositories"
    ]
    
    for query in test_queries:
        print(f"\n📝 Testing query: '{query}'")
        print("-" * 30)
        
        try:
            result = search_mcp_servers.invoke({"query": query})
            print(f"✅ Result:\n{result}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print("\n" + "="*50)

async def test_web_search_tool():
    """Test the general web search tool."""
    print("\n🌐 Testing Web Search Tool...")
    print("=" * 50)
    
    try:
        result = search_web.invoke({"query": "MCP Model Context Protocol"})
        print(f"✅ Web search result:\n{result}")
    except Exception as e:
        print(f"❌ Web search error: {str(e)}")

async def test_llm_service():
    """Test the LLM service with MCP agent."""
    print("\n🤖 Testing LLM Service with MCP Agent...")
    print("=" * 50)
    
    try:
        llm_service = LLMService()
        
        # Test conversation
        messages = []
        user_message = "I need MCP servers for file operations and database management"
        
        print(f"👤 User: {user_message}")
        print("🤖 AI Response:")
        print("-" * 30)
        
        response_chunks = []
        async for event in llm_service.get_chat_response_with_status(messages, user_message):
            response_chunks.append(event)
            if event["type"] == "tool_start":
                print(f"🔧 Tool started: {event['tool']}")
            elif event["type"] == "tool_end":
                print(f"✅ Tool completed: {event['tool']}")
            elif event["type"] == "response":
                print(event["content"])

        print(f"\n\n✅ Complete response received ({len(response_chunks)} events)")
        
    except Exception as e:
        print(f"❌ LLM Service error: {str(e)}")

def check_environment():
    """Check if all required environment variables are set."""
    print("🔧 Checking Environment Configuration...")
    print("=" * 50)
    
    required_vars = [
        'GROQ_API_KEY',
        'SERPAPI_KEY',
        'MONGO_URL',
        'DB_NAME',
        'JWT_SECRET'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not hasattr(settings, var) or not getattr(settings, var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set these in your .env file")
        return False
    else:
        print("✅ All required environment variables are set")
        return True

async def main():
    """Main test function."""
    print("🚀 MCP Server Finder - Test Suite")
    print("=" * 60)
    
    # Check environment
    if not check_environment():
        print("\n❌ Environment check failed. Please configure your .env file.")
        return
    
    print("\n" + "="*60)
    
    # Test individual tools
    await test_mcp_search_tool()
    await test_web_search_tool()
    
    # Test full LLM service
    await test_llm_service()
    
    print("\n" + "="*60)
    print("🎉 Test suite completed!")
    print("\nTo run the full application:")
    print("1. Backend: cd MCPFinder && python -m uvicorn server:app --reload")
    print("2. Frontend: cd MCPFinderFrontend && npm start")

if __name__ == "__main__":
    asyncio.run(main())


