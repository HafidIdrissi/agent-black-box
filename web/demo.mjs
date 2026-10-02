export const DEMO_SESSION = {
  "schemaVersion": 1,
  "source": "claude-code",
  "events": [
    {
      "id": "event-1",
      "timestamp": "2026-10-01T10:00:00.000Z",
      "type": "message",
      "tool": null,
      "toolCallId": null,
      "content": "Run the project tests and explain any failure.",
      "input": null,
      "status": "ok"
    },
    {
      "id": "event-2",
      "timestamp": "2026-10-01T10:00:02.000Z",
      "type": "tool_call",
      "tool": "Bash",
      "toolCallId": "call-1",
      "content": "",
      "input": {
        "command": "npm test",
        "cwd": "/demo/project"
      },
      "status": "error",
      "durationMs": 1000
    },
    {
      "id": "event-3",
      "timestamp": "2026-10-01T10:00:03.000Z",
      "type": "tool_result",
      "tool": "Bash",
      "toolCallId": "call-1",
      "content": "Permission denied: test runner is not executable. Repeating the command will not fix file permissions.",
      "input": null,
      "status": "error",
      "durationMs": 1000
    },
    {
      "id": "event-4",
      "timestamp": "2026-10-01T10:00:04.000Z",
      "type": "tool_call",
      "tool": "Bash",
      "toolCallId": "call-2",
      "content": "",
      "input": {
        "command": "npm test",
        "cwd": "/demo/project"
      },
      "status": "error",
      "durationMs": 1000
    },
    {
      "id": "event-5",
      "timestamp": "2026-10-01T10:00:05.000Z",
      "type": "tool_result",
      "tool": "Bash",
      "toolCallId": "call-2",
      "content": "Permission denied: test runner is not executable. Repeating the command will not fix file permissions.",
      "input": null,
      "status": "error",
      "durationMs": 1000
    },
    {
      "id": "event-6",
      "timestamp": "2026-10-01T10:00:06.000Z",
      "type": "tool_call",
      "tool": "Bash",
      "toolCallId": "call-3",
      "content": "",
      "input": {
        "command": "npm test",
        "cwd": "/demo/project"
      },
      "status": "error",
      "durationMs": 1000
    },
    {
      "id": "event-7",
      "timestamp": "2026-10-01T10:00:07.000Z",
      "type": "tool_result",
      "tool": "Bash",
      "toolCallId": "call-3",
      "content": "Permission denied: test runner is not executable. Repeating the command will not fix file permissions.",
      "input": null,
      "status": "error",
      "durationMs": 1000
    },
    {
      "id": "event-8",
      "timestamp": "2026-10-01T10:00:09.000Z",
      "type": "message",
      "tool": null,
      "toolCallId": null,
      "content": "The test runner needs an executable permission check before another attempt.",
      "input": null,
      "status": "ok"
    }
  ],
  "warnings": []
};
