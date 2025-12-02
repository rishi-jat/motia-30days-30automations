#!/bin/bash

echo "🧪 Testing Day-4 Workflow with Issue #491"
echo "=========================================="
echo ""

# Wait for server
echo "⏳ Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/__motia > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# Test the workflow
echo ""
echo "🚀 Triggering workflow for issue #491..."
RESPONSE=$(curl -s -X POST http://localhost:3000/pick-issue \
    -H "Content-Type: application/json" \
    -d '{"issueNumber": 491}')

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Wait for workflow to complete
echo "⏳ Waiting for workflow to complete (may take 30-60 seconds on first run)..."
sleep 50

# Check for fix guide
echo ""
if [ -d "fix-guides" ]; then
    echo "✅ Fix guides directory exists"
    ls -lah fix-guides/
    echo ""
    
    if [ -f "fix-guides/issue-491-fix-guide.md" ]; then
        echo "✅✅ SUCCESS! Fix guide generated for issue #491"
        echo ""
        echo "📄 First 20 lines of the fix guide:"
        echo "-----------------------------------"
        head -20 fix-guides/issue-491-fix-guide.md
    else
        echo "❌ Fix guide file not found"
    fi
else
    echo "❌ Fix guides directory not found"
fi

# Check cache
echo ""
echo "💾 Cache status:"
if [ -d ".cache" ]; then
    echo "Cache files: $(ls .cache | wc -l | tr -d ' ')"
    ls -lah .cache/
else
    echo "No cache directory"
fi

echo ""
echo "🔄 Now test again - should be instant with cache!"
echo "Run: curl -X POST http://localhost:3000/pick-issue -H \"Content-Type: application/json\" -d '{\"issueNumber\": 491}'"
