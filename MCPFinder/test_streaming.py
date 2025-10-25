#!/usr/bin/env python3
"""
Test script to verify streaming works from the backend
"""
import asyncio
import httpx
import json
import sys

async def test_streaming():
    """Test the streaming endpoint"""
    # You'll need to replace this with a valid token
    token = input("Enter your access token (or press Enter to skip): ").strip()
    
    if not token:
        print("⚠️  No token provided. Make sure you're logged in via the frontend first.")
        print("You can get the token from localStorage in the browser console:")
        print("  localStorage.getItem('access_token')")
        return
    
    url = "http://localhost:8000/api/chat"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "message": "Hello, can you tell me about MCP servers?",
        "conversation_id": None
    }
    
    print(f"\n🚀 Testing streaming to {url}...")
    print(f"📤 Sending message: {data['message']}\n")
    
    chunk_count = 0
    total_content = ""
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream('POST', url, json=data, headers=headers) as response:
            print(f"📡 Response status: {response.status_code}")
            print(f"📋 Headers: {dict(response.headers)}\n")
            
            if response.status_code != 200:
                print(f"❌ Error: {response.status_code}")
                print(await response.aread())
                return
            
            print("📥 Streaming response:")
            print("-" * 80)
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    try:
                        data = json.loads(line[6:])
                        if 'content' in data:
                            chunk_count += 1
                            content = data['content']
                            total_content += content
                            print(content, end='', flush=True)
                        elif 'done' in data and data['done']:
                            print("\n" + "-" * 80)
                            print(f"\n✅ Streaming completed!")
                            print(f"📊 Stats:")
                            print(f"   - Total chunks received: {chunk_count}")
                            print(f"   - Total content length: {len(total_content)}")
                            if 'conversation_id' in data:
                                print(f"   - Conversation ID: {data['conversation_id']}")
                        elif 'error' in data:
                            print(f"\n❌ Error: {data['error']}")
                    except json.JSONDecodeError as e:
                        print(f"\n⚠️  JSON parse error: {e}")
                        print(f"   Line: {line}")

if __name__ == "__main__":
    try:
        asyncio.run(test_streaming())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

