/**
 * @file Sentry Error logging and profiling entry point
 */


const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// Ensure to call this before requiring any other modules!
Sentry.init({
    dsn: "https://5f3fb854abf4e1be030b346cdc8f145c@o103684.ingest.us.sentry.io/4508601442304000",
    integrations: [
        // Add our Profiling integration
        nodeProfilingIntegration(),
    ],

    // Add Tracing by setting tracesSampleRate
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Set sampling rate for profiling
    // This is relative to tracesSampleRate
    profilesSampleRate: 1.0,
});