import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	serve,
	// sql
} from "bun";
// import dashboard from "./dashboard.html";
import homepage from "./index.html";

const server = serve({
	routes: {
		// ** HTML imports **
		// Bundle & route index.html to "/". This uses HTMLRewriter to scan the HTML for `<script>` and `<link>` tags, run's Bun's JavaScript & CSS bundler on them, transpiles any TypeScript, JSX, and TSX, downlevels CSS with Bun's CSS parser and serves the result.
		"/": homepage,
		// Bundle & route dashboard.html to "/dashboard"
		// "/dashboard": dashboard,

		// // ** API endpoints ** (Bun v1.2.3+ required)
		// "/api/users": {
		// 	async GET(req) {
		// 		const users = await sql`SELECT * FROM users`;
		// 		return Response.json(users);
		// 	},
		// 	async POST(req) {
		// 		const { name, email } = await req.json();
		// 		const [user] =
		// 			await sql`INSERT INTO users (name, email) VALUES (${name}, ${email})`;
		// 		return Response.json(user);
		// 	},
		// },
		"/api/run-output": {
			async GET() {
				try {
					const file = join(process.cwd(), "data", "output", "last-run.json");
					const json = readFileSync(file, "utf8");
					return new Response(json, {
						headers: { "Content-Type": "application/json" },
					});
				} catch {
					return Response.json(
						{ error: "No run output available yet" },
						{ status: 404 },
					);
				}
			},
		},
	},

	// Enable development mode for:
	// - Detailed error messages
	// - Hot reloading (Bun v1.2.3+ required)
	development: true,

	// Prior to v1.2.3, the `fetch` option was used to handle all API requests. It is now optional.
	// async fetch(req) {
	//   // Return 404 for unmatched routes
	//   return new Response("Not Found", { status: 404 });
	// },
});

console.log(`Listening on ${server.url}`);
