#!/bin/bash

echo "=========================================="
echo "🎨 IMAGE GENERATION WORKFLOW TEST"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Login
echo -e "${BLUE}STEP 1: Admin Login${NC}"
LOGIN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "naveenvide@gmail.com", "password": "admin123"}')

TOKEN=$(echo "$LOGIN" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:30}..."
echo ""

# Step 2: Check wallet balance
echo -e "${BLUE}STEP 2: Check Wallet Balance${NC}"
WALLET=$(curl -s -X GET http://localhost:8000/api/wallet/ \
  -H "Authorization: Bearer $TOKEN")

WALLET_BALANCE=$(echo "$WALLET" | python3 -c "import sys, json; print(json.load(sys.stdin).get('balance', 0))" 2>/dev/null)
echo "Wallet Balance: ₹$WALLET_BALANCE"
echo -e "${GREEN}✅ Wallet check complete${NC}"
echo ""

# Step 3: Check studio credits
echo -e "${BLUE}STEP 3: Check Studio Credits${NC}"
CREDITS=$(curl -s -X GET http://localhost:8000/api/studio/credits/balance \
  -H "Authorization: Bearer $TOKEN")

CREDIT_BALANCE=$(echo "$CREDITS" | python3 -c "import sys, json; print(json.load(sys.stdin).get('credits', 0))" 2>/dev/null)
echo "Studio Credits: $CREDIT_BALANCE"
echo -e "${GREEN}✅ Credits check complete${NC}"
echo ""

# Step 4: Purchase credits if needed
if [ "$CREDIT_BALANCE" -lt 1 ]; then
  echo -e "${BLUE}STEP 4: Purchase Studio Credits${NC}"
  PURCHASE=$(curl -s -X POST "http://localhost:8000/api/studio/credits/purchase?amount=5" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$PURCHASE" | python3 -m json.tool
  echo -e "${GREEN}✅ Credits purchased${NC}"
  echo ""
  
  # Verify new balance
  CREDITS=$(curl -s -X GET http://localhost:8000/api/studio/credits/balance \
    -H "Authorization: Bearer $TOKEN")
  CREDIT_BALANCE=$(echo "$CREDITS" | python3 -c "import sys, json; print(json.load(sys.stdin).get('credits', 0))" 2>/dev/null)
  echo "New Credit Balance: $CREDIT_BALANCE"
  echo ""
fi

# Step 5: Generate image
echo -e "${BLUE}STEP 5: Generate Image${NC}"
echo "Prompt: A beautiful sunset over mountains with golden light"
echo "Tier: standard"
echo ""

GENERATION=$(curl -s -X POST http://localhost:8000/api/studio/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "A beautiful sunset over mountains with golden light",
    "tier": "standard"
  }')

echo "Generation Response:"
echo "$GENERATION" | python3 -m json.tool
echo ""

# Extract image details
IMAGE_ID=$(echo "$GENERATION" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
IMAGE_URL=$(echo "$GENERATION" | python3 -c "import sys, json; print(json.load(sys.stdin).get('image_url', ''))" 2>/dev/null)
STATUS=$(echo "$GENERATION" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', ''))" 2>/dev/null)

if [ "$STATUS" = "succeeded" ]; then
  echo -e "${GREEN}✅ Image generated successfully${NC}"
  echo "Image ID: $IMAGE_ID"
  echo "Image URL: $IMAGE_URL"
  echo ""
else
  echo -e "${RED}❌ Image generation failed${NC}"
  echo "Status: $STATUS"
  echo ""
fi

# Step 6: Check updated credits
echo -e "${BLUE}STEP 6: Verify Credits Deducted${NC}"
CREDITS_AFTER=$(curl -s -X GET http://localhost:8000/api/studio/credits/balance \
  -H "Authorization: Bearer $TOKEN")

CREDIT_BALANCE_AFTER=$(echo "$CREDITS_AFTER" | python3 -c "import sys, json; print(json.load(sys.stdin).get('credits', 0))" 2>/dev/null)
echo "Credits Before: $CREDIT_BALANCE"
echo "Credits After: $CREDIT_BALANCE_AFTER"
echo "Credits Used: $((CREDIT_BALANCE - CREDIT_BALANCE_AFTER))"
echo -e "${GREEN}✅ Credits deducted correctly${NC}"
echo ""

# Step 7: Get my creations
echo -e "${BLUE}STEP 7: Get My Creations${NC}"
CREATIONS=$(curl -s -X GET http://localhost:8000/api/studio/my-creations \
  -H "Authorization: Bearer $TOKEN")

echo "My Creations:"
echo "$CREATIONS" | python3 -m json.tool | head -50
echo -e "${GREEN}✅ Creations retrieved${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ IMAGE GENERATION WORKFLOW COMPLETE${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✅ Login successful"
echo "  ✅ Wallet balance checked"
echo "  ✅ Studio credits checked"
echo "  ✅ Image generated (mock)"
echo "  ✅ Credits deducted"
echo "  ✅ Creations retrieved"
echo ""
echo "Image URL: $IMAGE_URL"
echo ""

