# Spec Delta: smart-extractor

## ADDED Requirements

### Requirement: Server-Side AI Environment Key Enforcement
The system SHALL execute AI model extractions using API keys configured solely in server environment variables without requiring or accepting client-provided API keys from the browser extension.

#### Scenario: Extension requests extraction without API key
- **WHEN** the browser extension sends an extraction request to `/api/extract` without an `x-api-key` header or key payload
- **THEN** the server uses the server's configured environment variables (`DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, or `GEMINI_API_KEY`) to complete the extraction

### Requirement: DeepSeek Model Execution Support
The system SHALL support extraction via DeepSeek's API using JSON object response mode when `DEEPSEEK_API_KEY` is present.

#### Scenario: DeepSeek extraction execution
- **WHEN** `DEEPSEEK_API_KEY` is configured in environment variables and `/api/extract` receives raw job text
- **THEN** the system calls DeepSeek's completions endpoint with `response_format: { type: "json_object" }` and returns validated structured job attributes
