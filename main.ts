import neo4j from "neo4j-driver";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import process from "node:process";

const config = {
  uri: process.env.NEO4J_URI,
  username: process.env.NEO4J_USERNAME,
  password: process.env.NEO4J_PASSWORD,
};

const driver = neo4j.driver(
  config.uri,
  neo4j.auth.basic(config.username, config.password),
);


const server = new McpServer({
  name: "Neo4J - MCP",
  version: "1.0.0",
});

server.tool(
  "query_neo4j",
  { query: z.string().describe("Query") },
  async ({ query }) => {
    const session = driver.session();
    const res = await session.run(query as string);
    session.close();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res),
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
server
  .connect(transport)
  .then(() => {})
  .catch(() => {});
