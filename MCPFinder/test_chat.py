#!/usr/bin/env python3
"""
Test script to verify chat functionality works end-to-end
"""

import asyncio
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from services.llm_service import LLMService, search_mcp_servers

async def test_chat_functionality():
    """Test the chat functionality without authentication."""
    print("🧪 Testing Chat Functionality")
    print("=" * 50)
    
    try:
        # Test MCP search tool directly
        print("\n1. Testing MCP Search Tool...")
        result = search_mcp_servers.invoke({"query": "file operations"})
        print(f"✅ MCP Search Result: {result[:200]}...")
        
        # Test LLM Service
        print("\n2. Testing LLM Service...")
        llm_service = LLMService()
        
        # Test with empty conversation history
        messages = []
        user_message = "Find MCP servers for database operations"
        
        print(f"👤 User: {user_message}")
        print("🤖 AI Response:")
        print("-" * 30)
        
        response_chunks = []
        async for chunk in llm_service.stream_chat_response(messages, user_message):
            response_chunks.append(chunk)
            print(chunk, end="", flush=True)
        
        print(f"\n\n✅ Complete response received ({len(response_chunks)} chunks)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main test function."""
    print("🚀 MCP Server Finder - Chat Test")
    print("=" * 60)
    
    success = await test_chat_functionality()
    
    print("\n" + "="*60)
    if success:
        print("🎉 Chat functionality test PASSED!")
        print("\nThe backend is working correctly. The frontend issues are likely:")
        print("1. Google OAuth origin configuration")
        print("2. Browser extension conflicts")
        print("3. WebSocket connection attempts to wrong ports")
    else:
        print("❌ Chat functionality test FAILED!")
        print("There are issues with the backend that need to be fixed.")

if __name__ == "__main__":
    asyncio.run(main())
