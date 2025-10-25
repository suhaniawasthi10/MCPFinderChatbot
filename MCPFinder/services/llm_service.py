from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langchain.agents import create_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from config import settings
import serpapi
import logging
import json

logger = logging.getLogger(__name__)

@tool
def search_mcp_servers(query: str) -> str:
    """Search for MCP (Model Context Protocol) servers and tools using SerpAPI.
    This tool searches for publicly available MCP servers, tools, and resources.
    Use this when users ask about MCP servers, tools, or need to find specific MCP implementations."""
    try:
        # Enhanced search query for MCP servers
        search_queries = [
            f"site:github.com MCP server {query}",
            f"Model Context Protocol server {query}",
            f"MCP tools {query}",
            f"langchain MCP server {query}",
            f"openai MCP server {query}"
        ]
        
        all_results = []
        
        for search_query in search_queries:
            try:
                search_results = serpapi.search({
                    "q": search_query,
                    "api_key": settings.SERPAPI_KEY,
                    "num": 3,
                    "engine": "google"
                })
                
                results = search_results.get("organic_results", [])
                
                for result in results:
                    title = result.get("title", "")
                    snippet = result.get("snippet", "")
                    link = result.get("link", "")
                    
                    # Filter for MCP-related results
                    if any(keyword in (title + snippet).lower() for keyword in 
                           ['mcp', 'model context protocol', 'langchain', 'openai', 'server', 'tool']):
                        all_results.append({
                            "title": title,
                            "snippet": snippet,
                            "link": link,
                            "query": search_query
                        })
            except Exception as e:
                logger.warning(f"Search failed for query '{search_query}': {str(e)}")
                continue
        
        if not all_results:
            return "No MCP servers or tools found for your query. Try searching for more specific terms like 'MCP server', 'Model Context Protocol', or specific tool names."
        
        # Remove duplicates and format results
        unique_results = []
        seen_links = set()
        
        for result in all_results:
            if result["link"] not in seen_links:
                unique_results.append(result)
                seen_links.add(result["link"])
        
        formatted_results = []
        for idx, result in enumerate(unique_results[:8], 1):  # Limit to 8 results
            formatted_results.append(
                f"{idx}. **{result['title']}**\n"
                f"   {result['snippet']}\n"
                f"   🔗 [View Source]({result['link']})\n"
                f"   📝 Found via: {result['query']}"
            )
        
        return "\n\n".join(formatted_results)
        
    except Exception as e:
        logger.error(f"Error in search_mcp_servers: {str(e)}")
        return f"Error searching for MCP servers: {str(e)}"

@tool
def search_web(query: str) -> str:
    """Search the web using SerpAPI for current information."""
    try:
        search_results = serpapi.search({
            "q": query,
            "api_key": settings.SERPAPI_KEY,
            "num": 5
        })
        
        results = search_results.get("organic_results", [])
        
        if not results:
            return "No results found."
        
        formatted_results = []
        for idx, result in enumerate(results[:5], 1):
            title = result.get("title", "")
            snippet = result.get("snippet", "")
            link = result.get("link", "")
            formatted_results.append(f"{idx}. {title}\n{snippet}\nSource: {link}")
        
        return "\n\n".join(formatted_results)
    except Exception as e:
        return f"Error searching the web: {str(e)}"

class LLMService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            openai_api_key=settings.OPENAI_API_KEY,
            streaming=True
        )
        
        # Create tools for the agent
        self.tools = [search_mcp_servers, search_web]
        
        # Create the agent
        self.agent = self._create_agent()
    
    def _create_agent(self):
        """Create a LangChain agent with MCP search capabilities."""
        # System prompt for MCP-focused assistance
        system_prompt = """You are an expert AI assistant specialized in helping users discover and work with MCP (Model Context Protocol) servers and tools.

Your primary capabilities:
1. **MCP Server Discovery**: Help users find publicly available MCP servers for various use cases
2. **Tool Recommendations**: Suggest appropriate MCP tools based on user needs
3. **Implementation Guidance**: Provide guidance on how to use and integrate MCP servers
4. **General Assistance**: Answer general questions and provide helpful information

When users ask about MCP servers, tools, or need to find specific implementations:
- Use the search_mcp_servers tool to find relevant GitHub repositories, documentation, and resources
- Provide detailed information about the servers you find
- Explain how they can be used and integrated
- Offer specific recommendations based on the user's requirements

For general questions not related to MCP, use the search_web tool to find current information.

Always be helpful, accurate, and provide actionable recommendations."""

        # Create the agent using the new API
        agent = create_agent(
            model=self.llm,
            tools=self.tools,
            system_prompt=system_prompt,
            debug=False
        )
        
        return agent
    
    async def get_chat_response_with_status(self, messages: list, user_message: str):
        """Get chat response with tool status updates using the MCP search agent."""
        try:
            # Convert conversation history to the format expected by the agent
            chat_history = []
            for msg in messages[-10:]:  # Keep last 10 messages for context
                if msg['sender'] == 'user':
                    chat_history.append(HumanMessage(content=msg['content']))
                else:
                    chat_history.append(AIMessage(content=msg['content']))
            
            # Prepare the input for the agent API
            agent_input = {
                "messages": chat_history + [HumanMessage(content=user_message)]
            }
            
            logger.info(f"Getting agent response with status for message: {user_message[:50]}...")
            
            full_response = ""
            
            # Use astream_events to track tool usage
            async for event in self.agent.astream_events(agent_input, version="v2"):
                kind = event.get("event")
                
                # Track tool calls
                if kind == "on_tool_start":
                    tool_name = event.get("name", "unknown")
                    logger.info(f"🔧 Tool started: {tool_name}")
                    yield {"type": "tool_start", "tool": tool_name}
                
                if kind == "on_tool_end":
                    tool_name = event.get("name", "unknown")
                    logger.info(f"✅ Tool completed: {tool_name}")
                    yield {"type": "tool_end", "tool": tool_name}
                
                # Capture the final response
                if kind == "on_chat_model_stream":
                    content = event.get("data", {}).get("chunk", {})
                    if hasattr(content, "content") and content.content:
                        full_response += content.content
            
            logger.info(f"Agent response completed. Length: {len(full_response)}")
            yield {"type": "response", "content": full_response}
            
        except Exception as e:
            logger.error(f"Error in get_chat_response_with_status: {str(e)}", exc_info=True)
            # Fallback to basic LLM response
            try:
                logger.info("Using fallback LLM...")
                messages_for_llm = [
                    SystemMessage(content="You are a helpful AI assistant specialized in MCP (Model Context Protocol) servers. Always provide helpful, accurate, and contextual responses based on the conversation history.")
                ]
                
                # Add conversation history
                for msg in messages:
                    if msg['sender'] == 'user':
                        messages_for_llm.append(HumanMessage(content=msg['content']))
                    else:
                        messages_for_llm.append(AIMessage(content=msg['content']))
                
                # Add current user message
                messages_for_llm.append(HumanMessage(content=user_message))
                
                # Get response
                response = await self.llm.ainvoke(messages_for_llm)
                yield {"type": "response", "content": response.content}
            except Exception as fallback_error:
                logger.error(f"Fallback error: {str(fallback_error)}")
                yield {"type": "response", "content": "I apologize, but I'm experiencing technical difficulties. Please try again later."}