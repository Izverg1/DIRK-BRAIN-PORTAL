# API CONTRACTS - CRAWLZILLA ENTERPRISE C++ PROJECT
**Case Management ID**: `#DIRK-MACOS-CPP-CRAWLZILLA-API-CONTRACTS-20250111-0001`

## 🌐 CLIENT/SERVER API SPECIFICATION

### API DESIGN PRINCIPLES

#### 📋 FUNDAMENTAL PRINCIPLES
1. **Contract-First Design**: All APIs defined before implementation
2. **Backward Compatibility**: Semantic versioning with compatibility guarantees
3. **Strong Typing**: Custom types for domain concepts, no primitive obsession
4. **Consistent Error Handling**: Standardized error response format
5. **Self-Documenting**: Clear, descriptive naming and comprehensive documentation
6. **Security-First**: Authentication, authorization, and input validation built-in
7. **Performance-Oriented**: Efficient serialization and minimal data transfer
8. **Idempotent Operations**: Safe retry behavior for critical operations

#### 🔒 SECURITY REQUIREMENTS
- **Authentication**: Bearer token authentication for all endpoints
- **Authorization**: Role-based access control (RBAC) enforcement
- **Input Validation**: Comprehensive validation with sanitization
- **Rate Limiting**: Configurable rate limits per client/endpoint
- **Audit Logging**: Complete request/response logging for compliance
- **HTTPS Only**: TLS 1.3+ mandatory for all communication

---

## 🎯 CORE API ENDPOINTS

### AUTHENTICATION & AUTHORIZATION

#### 🔐 Authentication Service
```typescript
interface AuthenticationAPI {
  // User authentication
  POST /api/v1/auth/login
  POST /api/v1/auth/logout
  POST /api/v1/auth/refresh
  
  // API key management
  POST /api/v1/auth/apikeys
  GET  /api/v1/auth/apikeys
  DELETE /api/v1/auth/apikeys/{keyId}
}
```

**Login Endpoint**
```yaml
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
  "username": string,
  "password": string,
  "mfaToken"?: string
}

Response (200):
{
  "accessToken": string,
  "refreshToken": string,
  "expiresIn": number,
  "tokenType": "Bearer",
  "user": {
    "id": string,
    "username": string,
    "roles": string[],
    "permissions": string[]
  }
}

Response (401):
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid username or password",
  "errorCode": 4001,
  "timestamp": "2025-01-11T10:30:00Z"
}
```
**Tag**: `#API-CONTRACT-AUTH-001`

### CRAWL MANAGEMENT

#### 🕷️ Crawl Configuration Service
```typescript
interface CrawlConfigAPI {
  // Crawl job management
  POST /api/v1/crawl/jobs
  GET  /api/v1/crawl/jobs
  GET  /api/v1/crawl/jobs/{jobId}
  PUT  /api/v1/crawl/jobs/{jobId}
  DELETE /api/v1/crawl/jobs/{jobId}
  
  // Crawl execution control
  POST /api/v1/crawl/jobs/{jobId}/start
  POST /api/v1/crawl/jobs/{jobId}/stop
  POST /api/v1/crawl/jobs/{jobId}/pause
  POST /api/v1/crawl/jobs/{jobId}/resume
}
```

**Create Crawl Job**
```yaml
POST /api/v1/crawl/jobs
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "name": string,
  "description"?: string,
  "configuration": {
    "startUrls": string[],
    "maxDepth": number,
    "maxPages": number,
    "delayMs": number,
    "concurrency": number,
    "followRedirects": boolean,
    "respectRobotsTxt": boolean,
    "userAgent": string,
    "headers": Record<string, string>,
    "selectors": {
      "include": string[],
      "exclude": string[]
    },
    "filters": {
      "urlPatterns": string[],
      "contentTypes": string[]
    }
  },
  "schedule"?: {
    "type": "once" | "recurring",
    "cronExpression"?: string,
    "timezone": string
  }
}

Response (201):
{
  "jobId": string,
  "name": string,
  "status": "created",
  "configuration": { /* same as request */ },
  "createdAt": "2025-01-11T10:30:00Z",
  "createdBy": string,
  "estimatedPages": number,
  "estimatedDuration": string
}
```
**Tag**: `#API-CONTRACT-CRAWL-001`

#### 📊 Crawl Status Monitoring
```typescript
interface CrawlStatusAPI {
  // Real-time status
  GET /api/v1/crawl/jobs/{jobId}/status
  GET /api/v1/crawl/jobs/{jobId}/progress
  GET /api/v1/crawl/jobs/{jobId}/statistics
  
  // Live monitoring
  GET /api/v1/crawl/jobs/{jobId}/stream (WebSocket)
}
```

**Get Crawl Status**
```yaml
GET /api/v1/crawl/jobs/{jobId}/status
Authorization: Bearer {token}

Response (200):
{
  "jobId": string,
  "status": "pending" | "running" | "paused" | "completed" | "failed" | "cancelled",
  "progress": {
    "pagesDiscovered": number,
    "pagesProcessed": number,
    "pagesSuccessful": number,
    "pagesFailed": number,
    "progressPercentage": number
  },
  "performance": {
    "pagesPerSecond": number,
    "averageResponseTime": number,
    "bytesDownloaded": number,
    "requestsInFlight": number
  },
  "timing": {
    "startedAt": "2025-01-11T10:30:00Z",
    "estimatedCompletion": "2025-01-11T12:45:00Z",
    "elapsedTime": string,
    "remainingTime": string
  },
  "errors": {
    "count": number,
    "recentErrors": [
      {
        "url": string,
        "error": string,
        "timestamp": "2025-01-11T10:35:00Z"
      }
    ]
  }
}
```
**Tag**: `#API-CONTRACT-STATUS-001`

### DATA EXTRACTION & STORAGE

#### 📄 Content Data Service
```typescript
interface ContentDataAPI {
  // Data retrieval
  GET /api/v1/data/pages
  GET /api/v1/data/pages/{pageId}
  GET /api/v1/data/pages/{pageId}/content
  GET /api/v1/data/pages/{pageId}/metadata
  
  // Data search
  POST /api/v1/data/search
  GET /api/v1/data/search/{searchId}/results
  
  // Data export
  POST /api/v1/data/export
  GET /api/v1/data/exports/{exportId}/status
  GET /api/v1/data/exports/{exportId}/download
}
```

**Search Content Data**
```yaml
POST /api/v1/data/search
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "query": {
    "text"?: string,
    "url"?: string,
    "domain"?: string,
    "contentType"?: string,
    "dateRange"?: {
      "from": "2025-01-01T00:00:00Z",
      "to": "2025-01-11T23:59:59Z"
    }
  },
  "filters": {
    "jobIds"?: string[],
    "statusCodes"?: number[],
    "minSize"?: number,
    "maxSize"?: number
  },
  "sorting": {
    "field": "crawledAt" | "url" | "size" | "responseTime",
    "order": "asc" | "desc"
  },
  "pagination": {
    "page": number,
    "pageSize": number,
    "maxResults": number
  }
}

Response (200):
{
  "searchId": string,
  "totalResults": number,
  "totalPages": number,
  "currentPage": number,
  "results": [
    {
      "pageId": string,
      "url": string,
      "title": string,
      "contentType": string,
      "size": number,
      "statusCode": number,
      "crawledAt": "2025-01-11T10:30:00Z",
      "jobId": string,
      "preview": string,
      "metadata": {
        "responseTime": number,
        "redirectCount": number,
        "linkCount": number,
        "imageCount": number
      }
    }
  ],
  "facets": {
    "domains": Record<string, number>,
    "contentTypes": Record<string, number>,
    "statusCodes": Record<string, number>
  }
}
```
**Tag**: `#API-CONTRACT-DATA-001`

### SYSTEM ADMINISTRATION

#### ⚙️ System Configuration Service
```typescript
interface SystemConfigAPI {
  // System health
  GET /api/v1/system/health
  GET /api/v1/system/metrics
  GET /api/v1/system/status
  
  // Configuration management
  GET /api/v1/system/config
  PUT /api/v1/system/config
  POST /api/v1/system/config/validate
  
  // Resource management
  GET /api/v1/system/resources
  POST /api/v1/system/resources/scale
}
```

**System Health Check**
```yaml
GET /api/v1/system/health
Authorization: Bearer {token}

Response (200):
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2025-01-11T10:30:00Z",
  "version": "1.0.0",
  "uptime": "2d 14h 32m 15s",
  "components": {
    "database": {
      "status": "healthy",
      "responseTime": 5,
      "details": {
        "connections": 45,
        "maxConnections": 100,
        "diskUsage": "15.2GB"
      }
    },
    "crawler": {
      "status": "healthy",
      "activeJobs": 3,
      "queuedJobs": 7,
      "workers": 12
    },
    "storage": {
      "status": "healthy",
      "diskSpace": "2.1TB available",
      "diskUsage": "68%"
    },
    "memory": {
      "status": "healthy",
      "usage": "12.8GB",
      "available": "19.2GB",
      "percentage": 40
    }
  },
  "performance": {
    "requestsPerSecond": 1250,
    "averageResponseTime": 45,
    "errorRate": 0.02
  }
}
```
**Tag**: `#API-CONTRACT-SYSTEM-001`

---

## 📡 REAL-TIME COMMUNICATION

### WebSocket API

#### 🔄 Live Data Streaming
```typescript
interface WebSocketAPI {
  // Connection management
  WS /api/v1/stream/connect?token={authToken}
  
  // Subscription management
  subscribe: {
    type: "crawl_progress" | "system_metrics" | "error_events",
    target: string // jobId, componentId, etc.
  }
  
  unsubscribe: {
    type: string,
    target: string
  }
}
```

**WebSocket Message Format**
```yaml
# Client → Server (Subscription)
{
  "id": "unique-request-id",
  "type": "subscribe",
  "payload": {
    "stream": "crawl_progress",
    "target": "job-12345",
    "options": {
      "updateInterval": 1000,
      "includeDetails": true
    }
  }
}

# Server → Client (Data Stream)
{
  "id": "unique-request-id",
  "type": "data",
  "stream": "crawl_progress",
  "timestamp": "2025-01-11T10:30:00Z",
  "payload": {
    "jobId": "job-12345",
    "pagesProcessed": 1250,
    "pagesPerSecond": 15.2,
    "progressPercentage": 25.5,
    "estimatedTimeRemaining": "2h 15m"
  }
}

# Server → Client (Error)
{
  "id": "unique-request-id",
  "type": "error",
  "error": {
    "code": "SUBSCRIPTION_FAILED",
    "message": "Invalid job ID",
    "details": {
      "jobId": "job-12345",
      "reason": "Job not found or access denied"
    }
  }
}
```
**Tag**: `#API-CONTRACT-WEBSOCKET-001`

---

## 🔧 ERROR HANDLING FRAMEWORK

### STANDARDIZED ERROR RESPONSES

#### ❌ Error Response Format
```typescript
interface ErrorResponse {
  error: string;           // Machine-readable error code
  message: string;         // Human-readable error message
  errorCode: number;       // Numeric error code for classification
  timestamp: string;       // ISO 8601 timestamp
  requestId: string;       // Unique request identifier
  details?: any;           // Additional error-specific details
  retryable?: boolean;     // Whether the operation can be retried
  retryAfter?: number;     // Suggested retry delay in seconds
}
```

#### 🏷️ Error Code Categories
```yaml
# Authentication Errors (4000-4099)
4001: INVALID_CREDENTIALS
4002: TOKEN_EXPIRED
4003: TOKEN_INVALID
4004: MFA_REQUIRED
4005: ACCOUNT_LOCKED

# Authorization Errors (4100-4199)
4101: INSUFFICIENT_PERMISSIONS
4102: RESOURCE_ACCESS_DENIED
4103: QUOTA_EXCEEDED
4104: RATE_LIMIT_EXCEEDED

# Validation Errors (4200-4299)
4201: INVALID_INPUT
4202: MISSING_REQUIRED_FIELD
4203: INVALID_FORMAT
4204: VALUE_OUT_OF_RANGE
4205: DUPLICATE_VALUE

# Resource Errors (4300-4399)
4301: RESOURCE_NOT_FOUND
4302: RESOURCE_CONFLICT
4303: RESOURCE_LOCKED
4304: RESOURCE_DELETED

# System Errors (5000-5099)
5001: INTERNAL_SERVER_ERROR
5002: DATABASE_ERROR
5003: EXTERNAL_SERVICE_ERROR
5004: CONFIGURATION_ERROR
5005: RESOURCE_EXHAUSTED
```

**Example Error Responses**
```yaml
# Validation Error
HTTP 400 Bad Request
{
  "error": "INVALID_INPUT",
  "message": "The maxDepth value must be between 1 and 10",
  "errorCode": 4204,
  "timestamp": "2025-01-11T10:30:00Z",
  "requestId": "req-abc123",
  "details": {
    "field": "configuration.maxDepth",
    "value": 15,
    "min": 1,
    "max": 10
  },
  "retryable": false
}

# Rate Limit Error
HTTP 429 Too Many Requests
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "API rate limit exceeded. Please try again later",
  "errorCode": 4104,
  "timestamp": "2025-01-11T10:30:00Z",
  "requestId": "req-def456",
  "details": {
    "limit": 1000,
    "window": "1h",
    "reset": "2025-01-11T11:00:00Z"
  },
  "retryable": true,
  "retryAfter": 1800
}
```
**Tag**: `#API-CONTRACT-ERROR-001`

---

## 📊 API VERSIONING STRATEGY

### SEMANTIC VERSIONING

#### 🔄 Version Format: `v{MAJOR}.{MINOR}.{PATCH}`
- **MAJOR**: Breaking changes that require client updates
- **MINOR**: Backward-compatible feature additions
- **PATCH**: Backward-compatible bug fixes and improvements

#### 📋 Compatibility Policy
```yaml
Supported Versions:
  - v1.0.x: Current stable version (full support)
  - v0.9.x: Previous version (security updates only)
  - v0.8.x: Deprecated (6-month notice before sunset)

Version Lifecycle:
  - Development: Alpha and beta versions for testing
  - Stable: Production-ready with full support
  - Maintenance: Security and critical bug fixes only
  - Deprecated: 6-month notice before end-of-life
  - End-of-Life: No further updates or support
```

#### 🎯 API Evolution Guidelines
1. **Additive Changes**: New fields, endpoints, optional parameters (MINOR)
2. **Compatible Changes**: Bug fixes, performance improvements (PATCH)
3. **Breaking Changes**: Require new MAJOR version
   - Remove endpoints or fields
   - Change required parameters
   - Modify response format
   - Change authentication requirements

**Tag**: `#API-CONTRACT-VERSIONING-001`

---

## 🛡️ SECURITY SPECIFICATIONS

### AUTHENTICATION & AUTHORIZATION

#### 🔐 Bearer Token Authentication
```yaml
Authorization: Bearer {jwt_token}

JWT Claims:
{
  "iss": "crawlzilla-auth",
  "sub": "user-12345",
  "aud": "crawlzilla-api",
  "exp": 1641906000,
  "iat": 1641902400,
  "jti": "token-unique-id",
  "roles": ["crawler_operator", "data_viewer"],
  "permissions": [
    "crawl:create",
    "crawl:read",
    "data:read"
  ],
  "tenant": "org-67890"
}
```

#### 🎭 Role-Based Access Control
```yaml
Roles & Permissions:

admin:
  - system:*
  - crawl:*
  - data:*
  - user:*

crawler_operator:
  - crawl:create
  - crawl:read
  - crawl:update
  - crawl:delete
  - data:read

data_analyst:
  - data:read
  - data:search
  - data:export

viewer:
  - crawl:read
  - data:read
  - system:health
```
**Tag**: `#API-CONTRACT-SECURITY-001`

### INPUT VALIDATION

#### 🔍 Validation Rules
```typescript
interface ValidationRules {
  // String validation
  maxLength: number;
  minLength: number;
  pattern: RegExp;
  allowedValues: string[];
  
  // Numeric validation
  min: number;
  max: number;
  integer: boolean;
  
  // Array validation
  maxItems: number;
  minItems: number;
  uniqueItems: boolean;
  
  // Custom validation
  customValidator: (value: any) => boolean;
  errorMessage: string;
}
```

**Common Validation Examples**
```yaml
URL Validation:
  pattern: "^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/.*)?$"
  maxLength: 2048
  
Job Name Validation:
  pattern: "^[a-zA-Z0-9_-]+$"
  minLength: 3
  maxLength: 64
  
Concurrency Validation:
  min: 1
  max: 100
  integer: true
  
Email Validation:
  pattern: "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$"
  maxLength: 254
```
**Tag**: `#API-CONTRACT-VALIDATION-001`

---

## 📈 PERFORMANCE SPECIFICATIONS

### RESPONSE TIME REQUIREMENTS

#### ⚡ Performance SLAs
```yaml
Endpoint Categories:

Health Checks:
  - Target: <10ms (95th percentile)
  - Timeout: 30 seconds
  - No authentication required

Authentication:
  - Target: <100ms (95th percentile)
  - Timeout: 5 seconds
  - High availability required

Job Management:
  - Target: <200ms (95th percentile)
  - Timeout: 30 seconds
  - Batch operations: <2 seconds

Data Queries:
  - Target: <500ms (95th percentile)
  - Timeout: 30 seconds
  - Large exports: <5 minutes

Real-time Streams:
  - Connection: <100ms
  - Update frequency: 1-5 seconds
  - Message latency: <50ms
```

#### 🎯 Throughput Requirements
```yaml
API Throughput Targets:

Standard Operations:
  - 10,000 requests/second per server
  - 100,000 requests/second system-wide
  
Heavy Operations:
  - 1,000 requests/second (data export)
  - 500 requests/second (complex search)
  
WebSocket Connections:
  - 50,000 concurrent connections per server
  - 500,000 concurrent connections system-wide
```
**Tag**: `#API-CONTRACT-PERFORMANCE-001`

---

**Last Updated**: 2025-01-11  
**Next Review**: 2025-01-18  
**API Architect**: Lead API Architect  
**Review Frequency**: Weekly API review, Monthly contract validation
