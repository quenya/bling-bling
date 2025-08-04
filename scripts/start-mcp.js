#!/usr/bin/env node

/**
 * Context7 MCP Server 시작 스크립트
 * 
 * Context7은 AI 어시스턴트가 대화 컨텍스트를 효과적으로 관리할 수 있게 해주는
 * Model Context Protocol (MCP) 서버입니다.
 * 
 * 기능:
 * - 대화 히스토리 저장 및 검색
 * - 컨텍스트 기반 정보 제공
 * - 세션 관리
 * - 메모리 최적화
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 체크
const requiredEnvVars = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Please set these variables in your .env file');
  console.error('   You can get these values from your Upstash Redis instance');
  process.exit(1);
}

// Context7 MCP 서버 시작
console.log('🚀 Starting Context7 MCP Server...');

const mcpServerPath = path.join(__dirname, 'node_modules', '@upstash', 'context7-mcp', 'dist', 'index.js');

const mcpProcess = spawn('node', [mcpServerPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

mcpProcess.on('error', (error) => {
  console.error('❌ Failed to start Context7 MCP Server:', error);
  process.exit(1);
});

mcpProcess.on('close', (code) => {
  console.log(`📦 Context7 MCP Server exited with code ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Context7 MCP Server...');
  mcpProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Context7 MCP Server...');
  mcpProcess.kill('SIGTERM');
});
