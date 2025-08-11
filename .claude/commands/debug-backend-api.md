# Debug Backend API

Please debug and resolve backend API issues in the DIRK Brain Portal FastAPI system.

**Steps to follow**:
1. **Identify the Issue**: Analyze error logs, status codes, and user reports
2. **Trace Request Flow**: Follow the request through middleware, endpoints, and database
3. **Check Dependencies**: Verify database connections, external service integrations
4. **Performance Analysis**: Profile slow endpoints and identify bottlenecks
5. **Test Solutions**: Implement fixes and validate with comprehensive testing
6. **Monitor Results**: Ensure resolution and set up alerting for similar issues

**Common Investigation Areas**:
- WebSocket connection stability for real-time agent updates
- Database query performance and connection pooling
- Authentication and authorization flows
- External service integration (MCP, Desktop Commander)
- Async operation handling and error management

**Tools to Use**:
- FastAPI logs and debugging tools
- Database query profiling
- API endpoint testing
- Performance monitoring

**Expected Deliverables**: Root cause analysis, implemented fix, test validation, and monitoring setup to prevent recurrence.