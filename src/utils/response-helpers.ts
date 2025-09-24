/**
 * Response formatting utilities for MCP tools
 */

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Format a JSON response with a title
 */
export function formatJsonResponse(title: string, data: any): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: `${title}:\n${JSON.stringify(data, null, 2)}`,
      },
    ],
  };
}
