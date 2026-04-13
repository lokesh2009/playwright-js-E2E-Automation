# HA Proxy Load Balance - Regression Test Scenarios

**Document Version:** 1.0  
**Date:** April 6, 2026  
**Test Type:** Regression Test Suite  
**Automation Level:** Semi-Automated with Manual Verification

---

## QUICK REFERENCE

**Total Scenarios:** 64 regression test cases  
**Estimated Execution Time:** 7-10 days with parallel execution  
**Pass Criteria:** 100% of CRITICAL, 100% of HIGH (unless risk-accepted)  
**Execution Approach:** Parallel tracks with sequential dependencies noted  

---

## TEST SCENARIO FORMAT

Each scenario includes:
- **Test ID:** Unique identifier (e.g., LB-001)
- **Name:** Clear, descriptive title
- **Priority:** CRITICAL, HIGH, MEDIUM, LOW
- **Preconditions:** Environment setup requirements
- **Test Steps:** Sequential numbered steps
- **Expected Result:** Acceptance criteria
- **Data Required:** Inputs, payloads, configurations
- **Tools Needed:** Specific tools to run test
- **Dependencies:** Other tests that must pass first
- **Notes:** Edge cases, important details

---

# 1. LOAD DISTRIBUTION REGRESSION SCENARIOS

## LB-001: Round Robin Distribution Validation

| Attribute | Value |
|-----------|-------|
| **Priority** | CRITICAL |
| **Dependencies** | None |
| **Duration** | 15 minutes |
| **Tools** | Apache JMeter, Curl, HA Proxy metrics |

### Preconditions
- 3 backend servers healthy and responding on ports 8080
- HA Proxy configured with `balance roundrobin`
- Load generator capacity: 1000+ RPS
- Metrics collection enabled (Prometheus scrape interval: 5s)

### Test Steps

1. **Setup**
   - Configure HA Proxy with exactly 3 equally-weighted backend servers
   - Configure load gen for 1000 RPS, 100 concurrent users, 5-minute duration
   - Baseline metrics: Note request rate per backend before traffic

2. **Load Generation**
   - Start load generator
   - Monitor real-time throughput: should show 300+ requests/min per backend
   - Continue for full 5-minute duration

3. **Collection & Analysis**
   - Collect request count from each backend (via logs, metrics, or counters)
   - Calculate distribution percentage for each server
   - Formula: `(Requests on Server X / Total Requests) × 100`

4. **Variance Calculation**
   ```
   Expected per server: 33.33% (1000/3)
   Server 1: 330 requests = 33.0%
   Server 2: 335 requests = 33.5%
   Server 3: 335 requests = 33.5%
   
   Variance calculation:
   Max - Min = 335 - 330 = 5
   Relative variance = (5 / 1000) × 100 = 0.5% ✓ PASS
   ```

### Expected Result
- Request distribution variance **≤ 10%** between any two backend servers
- No requests should be dropped or queued
- Response latency consistent (within 50ms) across all backends
- Health checks continue every 5 seconds without errors

### Acceptance Criteria
```
PASS IF:
✓ (Max requests - Min requests) / Total requests ≤ 10%
✓ P95 latency < 500ms
✓ Error rate = 0%
✓ All health checks successful

FAIL IF:
✗ Variance > 10%
✗ Any backend receives < 20% of traffic
✗ Error rate > 0.1%
✗ Health checks fail during test
```

### Data Required
- 3 backend servers in config
- Test dataset: 5000+ unique request URLs (to prevent caching bias)
- User configuration: synchronous requests, connection pooling enabled

### Notes
- Repeat in 3 consecutive runs to ensure consistency
- Document any variation between runs
- If variance > 10%, check backend response times (unequal latencies cause variance)

---

## LB-002: Least Connections Algorithm Validation

| Attribute | Value |
|-----------|-------|
| **Priority** | CRITICAL |
| **Dependencies** | Backend health checks functional |
| **Duration** | 20 minutes |
| **Tools** | JMeter, Custom Python script, HA Proxy stats |

### Preconditions
- Configure HA Proxy with `balance leastconn`
- 3 backend servers with different processing capacities (simulated):
  - Server 1: 10ms response time (fast)
  - Server 2: 50ms response time (medium)
  - Server 3: 100ms response time (slow)
- Monitoring enabled to track active connections per server

### Test Steps

1. **Configuration**
   - Set HA Proxy algorithm to `leastconn`
   - Verify config change active: `haproxy -f /etc/haproxy/haproxy.cfg -c`
   - Open HA Proxy stats page for real-time monitoring

2. **Load Generation - Phase 1 (Initial Fast Server)**
   - Start 1000 concurrent connections, 100 RPS
   - First 2 minutes: All traffic goes to Server 1 (fast response time)
   - Observe: Server 1 completes requests quickly, removes connections
   - Expected: Server 1 has < 10 active connections, Server 2/3 have 0

3. **Load Generation - Phase 2 (Saturation)**
   - Increase to 2000 RPS after 2 minutes
   - Server 1 can only handle ~100 RPS (due to 10ms response)
   - Remaining load sent to Server 2, then Server 3
   - Expected: Active connections distributed as [100, 200, 300] per server

4. **Verification**
   - Query HA Proxy: `echo "show stat" | socat stdio /var/run/haproxy.sock`
   - Extract `scur` (current sessions) and `smax` (session max) per backend
   - Calculate expected distribution based on processing capacity

5. **Load Increase - Phase 3**
   - Increase to 3000 RPS
   - Slower servers accumulate more pending connections (expected)
   - Fast server should still have lowest queue depth

### Expected Result
- New connections are always sent to server with **fewest active connections**
- Even though Server 3 is slower, it doesn't receive disproportionate load
- Server distribution: inversely proportional to response time
  - Fast server: ~35% of requests
  - Medium server: ~35% of requests
  - Slow server: ~30% of requests (fewer due to longer hold time)

### Acceptance Criteria
```
PASS IF:
✓ Server with fewest connections receives new requests
✓ No server exceeds configured maxconn limit
✓ P95 latency increases < 50ms even at 3000 RPS
✓ All health checks continue to pass
✓ CPU utilization remains balanced (within 10%)

FAIL IF:
✗ Requests sent to server with high connection count
✗ Single server becomes bottleneck (>60% of traffic)
✗ Any server hits maxconn and rejects requests
✗ P95 latency > 1000ms
```

### Data Required
- 3 backend servers with configured delays:
  ```java
  // Simulate delays with Thread.sleep() or netcat response delay
  Server 1: Thread.sleep(10);  // 10ms
  Server 2: Thread.sleep(50);  // 50ms
  Server 3: Thread.sleep(100); // 100ms
  ```
- Test payload: 1KB (minimal, to isolate backend latency)

### Notes
- If all servers responsive < 5ms, difference won't be visible; adjust delays
- Monitor HA Proxy CPU during test; leastconn requires connection tracking overhead
- Compare results with RoundRobin (LB-001) - leastconn should show better balance for unequal latencies

---

## LB-003: IP Hash / Source IP Affinity Validation

| Attribute | Value |
|-----------|-------|
| **Priority** | CRITICAL |
| **Dependencies** | None |
| **Duration** | 15 minutes |
| **Tools** | JMeter with multiple IPs, curl, Python test script |

### Preconditions
- Configure HA Proxy with `balance source` (IP hash)
- 3 backend servers in active rotation
- Load generator can simulate 500 unique client IPs (or use IP spoofing)
- Backend logs track client IP + request ID for verification

### Test Steps

1. **Setup**
   - Configure HA Proxy: `balance source` algorithm
   - Verify routing algorithm active: `haproxy -f /etc/haproxy/haproxy.cfg -c`
   - Create test matrix: 50 simulated client IPs × 10 requests each = 500 total requests

2. **Generate Traffic from Fixed IPs**
   - Iterate 50 unique source IPs (simulate via load generator with IP rotation)
   - Send 10 sequential requests from each IP
   - Track destination server for each request

3. **Collect Results**
   ```
   Client IP    → Request 1 → Server 2
   192.168.1.1  → Request 2 → Server 2
                → Request 3 → Server 2
                ...
                → Request 10 → Server 2 ✓ ALL ROUTED TO SAME SERVER
   
   192.168.1.2  → Request 1 → Server 1
                → Request 2 → Server 1
                ...
                → Request 10 → Server 1 ✓ ALL ROUTED TO SAME SERVER
   ```

4. **Verification - Consistency Check**
   - For each client IP: verify all 10 requests go to **same backend**
   - Create hash algorithm replica: `(IP_hash) % 3 = server_id`
   - Verify HA Proxy result matches expected hash

5. **Verification - Load Distribution**
   - 50 client IPs distributed across 3 servers = ~16-17 IPs per server
   - Expected: [16 IPs, 17 IPs, 17 IPs] (balanced hash distribution)
   - Measure actual distribution

### Expected Result
- **Same client IP always routed to same backend server** (100% consistency)
- All 50 requests from one IP reach same server
- Distribution across 3 servers is roughly balanced (~33% each)
- No requests from single IP fail over to different server during test

### Acceptance Criteria
```
PASS IF:
✓ 100% of requests from same IP go to same server
✓ No single IP has requests split across servers
✓ Distribution variance ≤ 15% (unequal hashing expected to vary)
✓ No re-hashing/server changes during test

FAIL IF:
✗ Any IP has requests to 2 different servers
✗ Server distribution > 50/50/0 (very unbalanced)
✗ Requests from same IP routed differently at different times
```

### Data Required
- 50 unique source IP addresses (can be from IP pool or simulated)
- Test requests: simple GET /api/test HTTP/1.1
- Backend must log source IP for verification

### Test Variants
- **Variant A:** Test with HTTP keep-alive (reuse connections)
- **Variant B:** Test with new connections each request (TCP reset between)
- **Variant C:** Test with IPv6 source addresses

### Notes
- IP hash not suitable for stateful sessions; prefer cookie-based for production
- If using load generator, check if it supports source IP spoofing
- Hash collisions are normal; some servers may get more IPs than others

---

## LB-004: Session Affinity / Cookie-Based Routing

| Attribute | Value |
|-----------|-------|
| **Priority** | HIGH |
| **Dependencies** | Backend health checks functional |
| **Duration** | 20 minutes |
| **Tools** | Postman/curl with cookie handling, JMeter cookie manager |

### Preconditions
- HA Proxy configured with cookie-based session affinity
- Backend sends session cookie (name: `JSESSIONID` or configurable)
- `cookie SERVERID insert indirect` configured in HA Proxy
- Backend can identify and log which server handled each request

### Test Steps

1. **Configuration Verification**
   ```
   backend webservers
       cookie SERVERID insert indirect
       server server1 192.168.1.10:8080 cookie s1
       server server2 192.168.1.11:8080 cookie s2
       server server3 192.168.1.12:8080 cookie s3
   ```

2. **Test Case A: Cookie Creation & Stickiness**
   - Send POST request to create session (login):
     ```
     POST /api/login HTTP/1.1
     Content-Type: application/json
     
     {"username":"testuser","password":"pass123"}
     ```
   - Capture response headers for `Set-Cookie: SERVERID=s1`
   - Verify cookie contains server identifier (s1, s2, or s3)

3. **Test Case B: Subsequent Requests**
   - Extract received cookie: `SERVERID=s1`
   - Send 20 subsequent requests with cookie:
     ```
     GET /api/session-data HTTP/1.1
     Cookie: SERVERID=s1
     ```
   - Verify all requests routed to **Server 1** (cookie s1)
   - Expected: Server 1 handles all 20 requests

4. **Test Case C: Different Session IDs**
   - Create session on Server 2: receive cookie `SERVERID=s2`
   - Send 10 requests with `s2` cookie →  Server 2
   - Create session on Server 3: receive cookie `SERVERID=s3`
   - Send 10 requests with `s3` cookie → Server 3
   - Verify each session isolated to its server

5. **Test Case D: Cookie Refresh/Rotation** (optional)
   - Test if HA Proxy resets cookie on each request (common pattern)
   - First request: receive `Set-Cookie: SERVERID=s1`
   - Second request with cookie: also receive `Set-Cookie: SERVERID=s1` (same value)
   - Verify sticky routing continues

6. **Load Verification**
   - Run 100 concurrent users, each with unique session
   - Expected: 100 sessions distributed across 3 servers (~33 each)
   - All requests within session go to same server

### Expected Result
- Cookie set on first response identifies target server
- Subsequent requests with that cookie routed to **same server every time**
- No session splits across servers during test
- Load distributed among all 3 servers via multiple sessions

### Acceptance Criteria
```
PASS IF:
✓ First request receives session cookie
✓ 100% of subsequent requests use same server (per cookie)
✓ No cookie-less requests create new sessions mid-test
✓ Session isolation: no data leakage between sessions
✓ Load balanced: each server handles ~33% of sessions

FAIL IF:
✗ Requests with same cookie routed to different servers
✗ Cookie not set in initial response
✗ Cookie lost or modified during transport
✗ Requests fail when cookie sent
```

### Data Required
- Test credentials: `testuser / pass123`
- Backend session endpoint: `/api/login` (POST), `/api/session-data` (GET)
- Session data: unique identifiable data per user (ID, username, etc.)

### Notes
- Different backends may have different session implementations
- Some backends use JSESSIONID (Java) vs custom cookie names
- Test with both HTTP and HTTPS to ensure cookie handling consistent
- Verify `httpOnly` and `Secure` flags preserved through HA Proxy

---

## LB-005: Connection Rebalancing on Backend Addition

| Attribute | Value |
|-----------|-------|
| **Priority** | MEDIUM |
| **Dependencies** | LB-001 (Round Robin confirmed working) |
| **Duration** | 15 minutes |
| **Tools** | JMeter, HA Proxy CLI, curl |

### Preconditions
- HA Proxy running with 3 backends in active load
- Sustained load: 500-1000 RPS during test
- 4th backend server prepared but not yet configured
- Ability to modify HA Proxy config and reload without downtime

### Test Steps

1. **Baseline (3 Servers)**
   - Start load: 500 RPS against 3 servers for 2 minutes
   - Baseline distribution: ~167 requests/server (33% each)
   - Latency baseline: P95 < 200ms

2. **Add New Backend (4th Server)**
   - Modify HA Proxy config: add server4 to backend definition
   - Graceful reload: `haproxy -f /etc/haproxy/haproxy.cfg -sf $(pgrep -f haproxy)`
   - Verify 4th server added to stats page immediately
   - **Important:** Load should NOT be reset/redistributed to existing connections
   - New connections should go to 4th server

3. **Monitor Rebalancing (5 minutes)**
   - Phase 1 (minutes 1-2): 4th server receives new connections
     - Expected: 4th server gradually receives traffic as old connections complete
     - Existing 3 servers finish existing connections
   - Phase 2 (minutes 3-5): Distribution stabilizes
     - Expected: ~125 requests/server (25% each) across 4 servers

4. **Measurement**
   ```
   Time     Server1  Server2  Server3  Server4  Distribution
   -2 min    167      167      167      -        33/33/33
   -1 min    167      167      167      -        33/33/33
   0 min     160      158      162      20       32/32/32/4
   +2 min    145      143      148      165      28/28/29/32 (avg: 125)
   +5 min    125      125      125      125      25/25/25/25 ✓
   ```

5. **Latency Check**
   - P95 latency during rebalancing: should remain < 250ms
   - No spikes when 4th server added
   - No request errors during reconfiguration

### Expected Result
- **New requests** immediately start routing to 4th server
- **Existing connections** complete on original servers (not forcefully closed)
- **Gradual rebalancing** as connections complete over 2-3 minutes
- **Final distribution:** ~25% load on each of 4 servers
- **No service disruption:** Users don't experience downtime or errors

### Acceptance Criteria
```
PASS IF:
✓ 4th server receives traffic within 30 seconds of addition
✓ Final distribution reaches 25% ±5% within 5 minutes
✓ No request errors during addition
✓ P95 latency remains < 250ms throughout
✓ No existing connections forcefully closed

FAIL IF:
✗ 4th server doesn't receive traffic after 2 minutes
✗ Final distribution < 20% or > 30% per server
✗ Error rate > 0.1% during reconfiguration
✗ P95 latency > 500ms during rebalancing
```

### Notes
- This tests **graceful scaling** - critical for production deployments
- Connection draining vs. connection reset has different user impact
- Monitor pool queue length during rebalancing
- Verify health check for 4th server shows UP before traffic sent

---

## LB-006 through LB-015: [Additional Load Distribution Scenarios]

*[Detailed test scenarios for remaining LB cases: Load Balancing with Weights, Cookie-Based Persistence, URL Parameter Persistence, Cross-Backend Sessions, etc.]*

---

# 2. HEALTH CHECK & FAILOVER REGRESSION SCENARIOS

## HC-001: Health Check Success Validation

| Attribute | Value |
|-----------|-------|
| **Priority** | CRITICAL |
| **Dependencies** | None |
| **Duration** | 10 minutes |
| **Tools** | curl, netstat, HA Proxy logs |

### Preconditions
- 3 backend servers running and healthy
- Health check configured: `option httpchk GET /health HTTP/1.1\r\nHost:\ localhost`
- Health check interval: 5 seconds
- Backend /health endpoint returns 200 OK with simple response

### Test Steps

1. **Baseline Health Check**
   - Start HA Proxy
   - Observe health checks in HA Proxy logs: `UP [UPP 2/3]` (healthy)
   - Verify no errors in health endpoint logs on backends
   - Connect to HA Proxy stats port: page shows 3 servers UP

2. **Load Generation & Health Monitoring**
   - Start load generation: 100 RPS
   - Verify health checks execute every 5 seconds (from HA Proxy logs)
   - Monitor `/var/log/haproxy.log` for health status messages

3. **Verify No False Positives**
   - Run for 5 minutes without disruption
   - Count health check requests on backend: should be 60 per server (5m × 12 checks/min)
   - Verify no unexpected DOWN notifications in logs
   - HA Proxy metrics show consistent UP status

### Expected Result
- Health checks pass consistently (every 5 seconds)
- Backend /health endpoint logs 60 requests per server in 5 minutes
- HA Proxy stats page shows all servers UP
- No error logs related to health checks
- Load continues without interruption

### Acceptance Criteria
```
PASS IF:
✓ All servers marked UP in HA Proxy stats
✓ Health check pass rate = 100%
✓ No unexpected DOWN/UP transitions
✓ No errors in HA Proxy logs related to health checks

FAIL IF:
✗ Any server marked DOWN when it's healthy
✗ Health check pass rate < 95%
✗ HA Proxy shows frequent flapping (UP/DOWN/UP/DOWN)
```

### Notes
- This baseline test confirms health check infrastructure works
- Without this passing, cannot trust failover tests
- Document baseline health check latency (how long per check)

---

## HC-002: Health Check Failure & Auto-Removal

| Attribute | Value |
|-----------|-------|
| **Priority** | CRITICAL |
| **Dependencies** | HC-001 (baseline confirmed) |
| **Duration** | 20 minutes |
| **Tools** | HA Proxy, curl, service control scripts |

### Preconditions
- HC-001 validated (health checks working)
- Load generation running: 500 RPS
- All 3 backends UP
- Ability to stop/start backend service (or simulate failure)

### Test Steps

1. **Baseline (All Healthy)**
   - 3 servers UP, receiving 500 RPS combined
   - Expected load: ~167 RPS per server
   - Health check response: 200 OK on all /health endpoints

2. **Introduce Failure - Server 2**
   - Stop the backend service on Server 2 via: `systemctl stop app-backend-server2`
   - OR return 500 from health endpoint via config change
   - **Track failure timestamp:** e.g., 10:05:32 AM

3. **Observe Failure Detection**
   - Monitor time until HA Proxy marks Server 2 DOWN
   - HA Proxy logs should show:
     ```
     [timestamp] Health check failure: backend server2 DOWN
     [timestamp] Removing server2 from active backend pool
     ```
   - Expected detection time: < 15 seconds (3 failed checks × 5s interval)

4. **Monitor Traffic Redistribution**
   - Immediately after Server 2 marked DOWN:
     - Existing connections to Server 2 should close gracefully
     - New requests redirected to Servers 1 & 3
   - Expected load redistribution:
     ```
     Before: Server1=167, Server2=167, Server3=167
     After:  Server1=250, Server2=0,   Server3=250 (25% variance acceptable)
     ```

5. **Verify No Impact**
   - Application continues serving requests normally
   - Error rate: 0% (failed requests to Server 2 handled gracefully)
   - Response latency: slight spike then return to normal
   - Health checks stop being sent to Server 2 (save CPU)

6. **Keep Failed Server Down for 3 minutes**
   - Verify sustained traffic on Servers 1 & 3
   - No requests sent to Server 2 even if its service lingering

### Expected Result
- Server 2 automatically marked DOWN within 15 seconds of failure
- Traffic completely shifted away from failed server
- No requests lost or returned with errors
- Remaining servers handle full load without degradation
- Health checks no longer sent to downed server

### Acceptance Criteria
```
PASS IF:
✓ DOWN detection time < 15 seconds (3 failed checks)
✓ Traffic completely removed from failed server
✓ Error rate = 0%
✓ Remaining servers handle full 500 RPS
✓ P95 latency increases < 100ms during failover
✓ Health check requests stop for downed server

FAIL IF:
✗ Detection time > 30 seconds
✗ Requests still sent to failed server
✗ Error rate > 0.1%
✗ Remaining servers can't handle traffic (1000 RPS on 2 servers)
✗ P95 latency increases > 300ms
```

### Data Required
- Service control commands for each backend
- Health endpoint that can return 500 on demand
- Load generation tool with tracking per backend

### Notes
- Most critical test for reliability assessment
- Detection time depends on health check interval; 5s recommended
- Monitor connection draining: are existing connections allowed to complete?

---

## HC-003 through HC-012: [Additional Health Check Scenarios]

*[Detailed scenarios: Health Check Timeout, Connection Resets, Slow Health Checks, Failover Latency, Recovery Detection, Flapping Prevention, Cascading Failures, Complete Cluster Failure]*

---

# 3. SESSION PERSISTENCE REGRESSION SCENARIOS

## SP-001: Cookie-Based Sticky Session Validation

[Similar format to LB-004, extended to verify cookie inheritance, modification, and edge cases]

---

## SP-002 through SP-010: [Additional Session Persistence Scenarios]

*[Session persistence on backend failure, timeouts, concurrent sessions, IP-based affinity, custom headers, HTTPS handling, etc.]*

---

# 4. SSL/TLS REGRESSION SCENARIOS

## SSL-001: HTTPS Termination & Decryption

| Attribute | Value |
|-----------|-------|
| **Priority** | CRITICAL |
| **Dependencies** | None |
| **Duration** | 15 minutes |
| **Tools** | Curl with HTTPS, ssldump, Wireshark, OpenSSL |

### Preconditions
- HA Proxy configured with SSL frontend
- Valid SSL certificate installed and configured
- Backend configured for HTTP (unencrypted)
- Monitoring tools available to inspect traffic

### Test Steps

1. **Configuration Verification**
   ```haproxy
   frontend https_web
       bind *:443 ssl crt /etc/ssl/certs/server.pem
       mode http
       default_backend webservers
   
   backend webservers
       mode http  # Backend connects via plain HTTP
       balance roundrobin
       server server1 192.168.1.10:8080
   ```

2. **HTTPS Client Request**
   - Client makes HTTPS request to HA Proxy on port 443:
     ```
     curl -v https://loadbalancer.example.com/api/test
     ```
   - Verify TLS handshake succeeds
   - Verify certificate presented matches domain

3. **Request Decryption Verification**
   - Capture traffic between HA Proxy and backend (Wireshark)
   - Verify:
     - Client↔HA: HTTPS (encrypted, TLS 1.2+)
     - HA→Backend: HTTP (plaintext)
   - Example packet inspection:
     ```
     Client TLS Data: [encrypted bytes]
     HA Proxy decrypts to:
     GET /api/test HTTP/1.1
     Host: loadbalancer.example.com
     ```

4. **Backend Response**
   - Backend returns plain HTTP response:
     ```
     200 OK
     Content-Type: application/json
     {"result":"success"}
     ```
   - HA Proxy receives plaintext, encrypts via TLS, sends to client

5. **Traffic Analysis**
   - Verify no plaintext data exposed on client-facing connection
   - Verify backend never receives TLS encryption headers
   - Response received intact by client

### Expected Result
- HTTPS connection established successfully with certificate validation
- Request decrypted on HA Proxy, forwarded to backend as HTTP
- Response encrypted by HA Proxy and delivered to client via TLS
- No plaintext credentials or data exposed to backend network

### Acceptance Criteria
```
PASS IF:
✓ TLS handshake successful
✓ Certificate valid and matches domain
✓ Client receives encrypted response
✓ Backend receives plaintext HTTP request
✓ No TLS errors in HA Proxy logs

FAIL IF:
✗ Certificate validation failures
✗ TLS handshake timeout
✗ Backend receives encrypted TLS data
✗ Client receives plaintext response
✗ Certificate CN doesn't match hostname
```

### Data Required
- Valid SSL certificate with proper CN/SAN
- HTTPS client tool (curl, postman, Python requests)
- Network packet capture tool

### Notes
- Essential for any HTTPS-fronted service
- Verify certificate chain is complete
- Check certificate validity dates (not expired)

---

## SSL-002 through SSL-008: [Additional SSL/TLS Scenarios]

*[Certificate validation, SNI, cipher suites, HSTS headers, certificate renewal, HTTP redirect, mTLS]*

---

# 5. PERFORMANCE & LOAD REGRESSION SCENARIOS

## PERF-001: Baseline Throughput & Latency

| Attribute | Value |
|-----------|-------|
| **Priority** | CRITICAL |
| **Dependencies** | LB-001 (distribution validated) |
| **Duration** | 15 minutes |
| **Tools** | JMeter, Prometheus metrics, custom monitoring |

### Preconditions
- 3 healthy backend servers
- HA Proxy configured with round-robin
- Load generator capable of sustained 1000+ RPS
- Monitoring stack active (Prometheus, Grafana)

### Test Steps

1. **Baseline Load Generation**
   - Start JMeter with configuration:
     - Constant throughput: 1000 RPS
     - Concurrent threads: 100
     - Duration: 10 minutes
     - Connection reuse: enabled (keep-alive)
     - Request mix: 50% GET /, 30% GET /api/data, 20% POST /data

2. **Metrics Collection**
   - Collect metrics every 10 seconds:
     - Throughput (RPS)
     - Response time: Min, Mean, P50, P95, P99, Max
     - Error rate (%)
     - HTTP status codes distribution

3. **Analysis**
   ```
   Metrics Sample (minute 5 of 10):
   
   Throughput: 1003 RPS ✓
   Response Time:
     Min: 5ms
     Mean: 45ms
     P50: 35ms
     P95: 180ms ← Acceptable < 500ms target
     P99: 350ms
     Max: 2100ms (outlier)
   Error Rate: 0.02%
   Status Codes:
     200: 99.98%
     500: 0.02%
   ```

4. **Resource Monitoring**
   - CPU utilization on HA Proxy: 20-30%
   - Memory usage: Stable, no growth
   - Network bandwidth: Observe actual usage vs capacity
   - Backend CPU/Memory: 50-60% utilization

5. **Stress Test Ramp (Optional)**
   - Minute 1-2: 500 RPS (warm up)
   - Minute 3-4: 1000 RPS (baseline)
   - Minute 5-7: 1500 RPS (verify stability)
   - Minute 8-10: 1000 RPS (cool down)

### Expected Result
- **Throughput:** Sustained 1000 RPS without errors
- **P95 Latency:** < 500ms (benchmark target)
- **Error Rate:** < 0.1%
- **No timeouts:** All requests complete successfully
- **Stable metrics:** No degradation over 10 minutes

### Acceptance Criteria
```
PASS IF:
✓ Sustained 1000 RPS for full 10 minutes
✓ P95 response time < 500ms
✓ Error rate < 0.1%
✓ No 5xx errors
✓ CPU utilization < 80%

FAIL IF:
✗ Throughput drops at any point
✗ P95 latency > 500ms
✗ Error rate > 0.1%
✗ Requests timeout
✗ CPU > 80% on HA Proxy
```

### Data Required
- Backend responses: JSON/HTML payloads (1-5 KB typical)
- Test URLs: /api/test, /api/data, /status
- Request headers: User-Agent, Accept, etc. (realistic)

### Notes
- This is the baseline; all other performance tests reference this
- Run test 3 times to verify consistency
- Document actual max_openfiles and netstat -an stats for reference
- Check for connection leaks (unused connections in TIME_WAIT state)

---

## PERF-002 through PERF-012: [Additional Performance Scenarios]

*[Spike load, sustained high load, max capacity, connection pool exhaustion, memory leaks, CPU monitoring, latency distribution, large payloads, ramp-up, keep-alive efficiency]*

---

# 6. CONFIGURATION REGRESSION SCENARIOS

## CONFIG-001: Configuration Validation & Reload

[Detailed test scenarios for configuration changes, syntax validation, runtime reload without downtime]

---

# 7. ERROR HANDLING REGRESSION SCENARIOS

## ERROR-001: Malformed HTTP Request Handling

[Scenarios for malformed requests, connection resets, timeouts, service unavailability, rate limiting, etc.]

---

# REGRESSION TEST EXECUTION MATRIX

## Week 1: Foundation & Baseline (Days 1-3)

| Day | Track | Test IDs | Status |
|-----|-------|----------|--------|
| **Day 1** | **Foundation** | LB-001, LB-002, HC-001, HC-002 | Sequential |
| **Day 2** | **Parallel A** | LB-003, LB-004, SP-001 | Started |
|  | **Parallel B** | SSL-001, CONFIG-001 | Started |
|  | **Parallel C** | ERROR-001 | Started |
| **Day 3** | **Review** | All Day 1-2 results | Analysis |

## Week 2: Comprehensive Suite (Days 4-7)

| Day | Parallel Tracks | Estimated Duration |
|-----|-----------------|-------------------|
| **Day 4** | LB-005-010, HC-003-006 | 6 hours each |
| **Day 5** | SP-002-006, SSL-002-004 | 6 hours each |
| **Day 6** | PERF-001-006 (baseline, spike, sustained) | 8-10 hours |
| **Day 7** | CONFIG-002-005, ERROR-002-005, LB-011-015 | 6 hours each |

## Week 3: Endurance & Final (Days 8-10)

| Day | Focus | Duration |
|-----|-------|----------|
| **Day 8** | PERF-007-009 (Memory, CPU, Latency Distribution) | 12+ hours |
| **Day 9** | SP-007-010, HC-007-012 (Advanced scenarios) | 8 hours |
| **Day 10** | Final regression run (critical tests) + Report | 4 hours |

---

# TEST EXECUTION CHECKLIST

## Pre-Execution (Day 0)

- [ ] All 3 backend servers healthy (response times < 50ms to /health)
- [ ] HA Proxy version verified: 2.4.x LTS
- [ ] SSL certificate valid (not expired, CN matches)
- [ ] Load generator nodes verified (capacity > 10,000 RPS)
- [ ] Monitoring stack online (Prometheus, Grafana, Logs)
- [ ] Test environment isolated from other traffic
- [ ] All team members trained on test procedures
- [ ] Rollback procedure documented and tested
- [ ] Notify stakeholders: testing window is 8am-6pm PST

## During Execution

Each test day:
- [ ] Run daily standup (8:30 am) - block status, issues, next steps
- [ ] Collect metrics continuously (no gaps)
- [ ] Archive logs and results daily
- [ ] Document any anomalies or deviations immediately
- [ ] Escalate critical failures within 30 minutes
- [ ] Update stakeholders on progress (end of day email)

## Post-Execution

- [ ] All metrics compiled and analyzed
- [ ] Findings documented with root causes
- [ ] Performance graphs generated
- [ ] Test report written 48 hours after last test
- [ ] Recommendations finalized
- [ ] Stakeholder review meeting scheduled
- [ ] Artifacts packaged for archive

---

# DEFECT SEVERITY MATRIX

| Severity | Description | Example | Impact | Resolution |
|----------|-------------|---------|--------|-----------|
| **P1-Critical** | Service unavailable, data loss | All servers down, failover doesn't work | Can't go to production | Fix before production |
| **P2-High** | Major feature failure, high data loss risk | 50% traffic loss on failover | Strongly blocks production | Fix or risk-accept |
| **P3-Medium** | Degraded performance, workaround exists | P95 latency 1500ms instead of 500ms | Impacts user experience | Fix in next release |
| **P4-Low** | Minor issue, doesn't block functionality | Metrics not collected, but system works | Nice to have | Fix when convenient |

---

# PASS/FAIL CRITERIA SUMMARY

## Go-No-Go Checklist for Production

**GO if ALL of these pass:**
1. ✅ All CRITICAL tests passed (100%)
2. ✅ All HIGH tests passed (100%) OR risk-accepted in writing
3. ✅ P95 latency baseline test shows < 500ms
4. ✅ Failover detection < 5 seconds
5. ✅ Zero data loss in session tests
6. ✅ SSL/TLS certificate validation working
7. ✅ 48-hour endurance test stable (no memory leaks)
8. ✅ Monitoring dashboards functional
9. ✅ Rollback procedure tested & confirmed
10. ✅ Stakeholder sign-off obtained

**NO-GO if ANY of these fail:**
- P1 Critical issues unresolved
- Failover time > 10 seconds
- Inconsistent load distribution (> 30% variance)
- Data loss observed in any scenario
- SSL/TLS certificate failures
- Error rate > 1%
- Backend out of memory/crashed during test
- No rollback path available

---

# APPENDIX: SAMPLE TEST DATA

## Backend Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2026-04-06T10:30:45Z",
  "checks": {
    "database": "ok",
    "cache": "ok",
    "disk_space": "85% used - ok"
  }
}
```

## Performance Metrics Template
```
Test: Baseline Throughput (PERF-001)
Date: 2026-04-06, Duration: 10 minutes

Throughput: 1000 RPS (target) → 998 RPS (actual) ✓
Response Times:
  Min: 4.2ms
  Mean: 47ms
  P50: 38ms
  P95: 185ms [TARGET: 500ms] ✓
  P99: 295ms
  Max: 1843ms

Error Rate: 0.019% [TARGET: < 0.1%] ✓
Status Distribution:
  200: 998 requests
  500: 2 requests

Resource Utilization:
  HA Proxy CPU: 26.3%
  HA Proxy Memory: 180 MB
  Backend CPUs: Avg 52.1%
  Network: 850 Mbps / 10 Gbps capacity

RESULT: PASS ✓
```

---

**End of Regression Test Scenarios Document**

*For detailed test execution and reporting questions, contact QA Architecture Team*
