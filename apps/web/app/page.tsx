export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-2xl font-bold">Fantasy Football MCP Server</h1>
      </div>

      <div className="relative flex place-items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">HTTP MCP Endpoint</h2>
          <p className="mb-4">
            This server exposes Sleeper Fantasy Football tools via HTTP MCP.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left">
            <p><strong>Endpoint:</strong> <code>/api/mcp</code></p>
            <p><strong>Method:</strong> POST</p>
            <p><strong>Auth:</strong> Bearer token required</p>
            <p><strong>Format:</strong> JSON-RPC 2.0</p>
          </div>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-2 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            Available Tools{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            User, League, Player, Draft, and System tools from Sleeper API
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            Authentication{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Protected with Bearer token authentication
          </p>
        </div>
      </div>
    </main>
  );
}
