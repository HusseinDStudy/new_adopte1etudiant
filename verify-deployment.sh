#!/bin/bash

# Deployment Verification Script
# Usage: ./verify-deployment.sh YOUR_SERVER_IP

if [ $# -eq 0 ]; then
    echo "Usage: $0 <SERVER_IP>"
    echo "Example: $0 3.15.123.45"
    exit 1
fi

SERVER_IP=$1
echo "🔍 Verifying deployment on server: $SERVER_IP"
echo "=================================================="

# 1. Test web application
echo ""
echo "🌐 Testing Web Application..."
if curl -s -I http://$SERVER_IP | head -1 | grep -q "200\|301\|302"; then
    echo "✅ Web server is responding"
    echo "📄 Response headers:"
    curl -s -I http://$SERVER_IP | head -5
else
    echo "❌ Web server not responding"
fi

# 2. Test API health endpoint
echo ""
echo "🏥 Testing API Health Endpoint..."
if curl -s http://$SERVER_IP:8080/health | grep -q "ok\|healthy\|success"; then
    echo "✅ API health check passed"
    echo "📋 Health response:"
    curl -s http://$SERVER_IP:8080/health
else
    echo "❌ API health check failed or no response"
    echo "🔍 Attempting connection..."
    curl -v http://$SERVER_IP:8080/health 2>&1 | head -10
fi

# 3. Test API endpoints
echo ""
echo "🔌 Testing API Endpoints..."
endpoints=("/api/offers" "/api/skills" "/api/auth/me")
for endpoint in "${endpoints[@]}"; do
    echo "Testing $endpoint..."
    status_code=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:8080$endpoint)
    if [ "$status_code" = "200" ] || [ "$status_code" = "401" ] || [ "$status_code" = "403" ]; then
        echo "✅ $endpoint - Status: $status_code (Expected)"
    else
        echo "⚠️  $endpoint - Status: $status_code"
    fi
done

# 4. Test response time
echo ""
echo "⏱️ Testing Response Time..."
response_time=$(curl -o /dev/null -s -w "%{time_total}" http://$SERVER_IP)
echo "🚀 Total response time: ${response_time}s"

# 5. Check open ports
echo ""
echo "🔍 Checking Open Ports..."
if command -v nmap &> /dev/null; then
    echo "📡 Port scan results:"
    nmap -p 80,8080,443 $SERVER_IP 2>/dev/null | grep -E "80|8080|443"
else
    echo "⚠️  nmap not installed, skipping port scan"
fi

# 6. Test connectivity
echo ""
echo "🌐 Testing Connectivity..."
if ping -c 3 $SERVER_IP &> /dev/null; then
    echo "✅ Server is reachable via ping"
else
    echo "❌ Server is not reachable via ping"
fi

# 7. Summary
echo ""
echo "📊 VERIFICATION SUMMARY"
echo "=================================================="
echo "🌐 Web App: http://$SERVER_IP"
echo "🔧 API: http://$SERVER_IP:8080"
echo "🏥 Health: http://$SERVER_IP:8080/health"
echo ""
echo "💡 If tests fail:"
echo "   1. Check if server is running: ssh ubuntu@$SERVER_IP"
echo "   2. Check containers: docker-compose -f docker-compose.prod.yml ps"
echo "   3. Check logs: docker-compose -f docker-compose.prod.yml logs"
echo "   4. Check firewall: sudo ufw status"
echo ""
echo "🎉 Verification completed!" 