#!/bin/bash

# Patent Management System - Development Startup Script
# This script starts both backend and frontend development servers

echo "🚀 Starting Patent Management System..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

# Go back to root
cd ..

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    jobs -p | xargs -r kill
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}🔧 Starting servers...${NC}"

# Start backend server
echo -e "${YELLOW}Starting backend server on http://localhost:5001...${NC}"
cd backend
unset PORT # Clear any existing PORT environment variable
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Go back to root and start frontend
cd ..
echo -e "${YELLOW}Starting frontend server on http://localhost:5173...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo ""
echo -e "${GREEN}✅ Patent Management System is running!${NC}"
echo "=================================="
echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}🔧 Backend:${NC}  http://localhost:5001"
echo -e "${BLUE}📊 Health:${NC}   http://localhost:5001/api/health"
echo ""
echo -e "${YELLOW}📋 Default Login Credentials:${NC}"
echo "   Admin:     admin / admin123"
echo "   Institute: neftgaz / neftgaz123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID