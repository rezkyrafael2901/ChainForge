#!/usr/bin/env node

/**
 * ChainForge Engine — CLI entry point & programmatic API.
 *
 * Pipeline: parse → generate → (compile) → (deploy)
 */

import { createInterface } from 'node:readline';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import dotenv from 'dotenv';

import { parsePrompt, parsePromptSafe } from './parser.js';
import { generateContracts } from './generator.js';
import { compileContracts, deployToTestnet, verifyContract } from './deployer.js';
import type { ProjectSpec, DeployResult } from './types.js';

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

// --- Public API ---

export { parsePrompt, parsePromptSafe } from './parser.js';
export { generateContracts } from './generator.js';
export { compileContracts, deployToTestnet, verifyContract } from './deployer.js';
export type { ProjectSpec, ContractSpec, FrontendSpec, DeployResult } from './types.js';

// --- CLI Pipeline ---

interface PipelineOptions {
  prompt: string;
  outputDir?: string;
  deploy?: boolean;
  privateKey?: string;
  rpcUrl?: string;
  safe?: boolean;
}

/**
 * Full pipeline: parse → generate → (optionally) compile & deploy.
 */
export async function runPipeline(options: PipelineOptions): Promise<{
  spec: ProjectSpec;
  files: Map<string, string>;
  deployResult?: DeployResult;
}> {
  const {
    prompt,
    outputDir = './generated',
    deploy = false,
    privateKey,
    rpcUrl = 'https://rpc.sepolia.org',
    safe = true,
  } = options;

  // Step 1: Parse
  console.log('\n📝 Step 1: Parsing prompt...');
  const spec = safe ? await parsePromptSafe(prompt) : await parsePrompt(prompt);
  console.log(`   Project: ${spec.name} (${spec.type} on ${spec.chain})`);
  console.log(`   Contracts: ${spec.contracts.map((c) => c.name).join(', ')}`);
  console.log(`   Features: ${spec.features.join(', ') || 'none'}`);

  // Step 2: Generate
  console.log('\n🔧 Step 2: Generating code...');
  const files = generateContracts(spec);
  console.log(`   Generated ${files.size} files`);

  // Step 3: Write to disk
  const outDir = resolve(outputDir);
  console.log(`\n💾 Step 3: Writing to ${outDir}...`);
  writeFilesToDisk(outDir, files);
  console.log('   ✓ All files written');

  // Step 4: Optionally compile
  let deployResult: DeployResult | undefined;
  try {
    await compileContracts(outDir);
  } catch (err) {
    console.warn(`   ⚠️  Compilation failed (forge may not be installed): ${(err as Error).message}`);
  }

  // Step 5: Optionally deploy
  if (deploy) {
    if (!privateKey) {
      console.warn('   ⚠️  Cannot deploy: no private key provided. Use --private-key flag.');
    } else {
      console.log('\n🚀 Step 5: Deploying...');
      deployResult = await deployToTestnet(outDir, privateKey, rpcUrl);
      if (deployResult.success) {
        console.log('   ✅ Deployment successful!');
        for (const c of deployResult.contracts) {
          console.log(`   → ${c.name}: ${c.address}`);
        }
        console.log(`   Explorer: ${deployResult.explorerUrl}`);
      } else {
        console.error('   ❌ Deployment failed:', deployResult.errors.join(', '));
      }
    }
  }

  console.log('\n✅ Done!');
  return { spec, files, deployResult };
}

// --- File Writer ---

function writeFilesToDisk(baseDir: string, files: Map<string, string>): void {
  for (const [relativePath, content] of files) {
    const fullPath = join(baseDir, relativePath);
    mkdirSync(resolve(fullPath, '..'), { recursive: true });
    writeFileSync(fullPath, content, 'utf-8');
    console.log(`   ✓ ${relativePath}`);
  }
}

// --- Interactive CLI ---

async function promptUser(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((res) => {
    rl.question(question, (answer) => {
      rl.close();
      res(answer.trim());
    });
  });
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--deploy') {
      args.deploy = true;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else if (!args.prompt) {
      args.prompt = arg;
    }
  }
  return args;
}

// --- Main Entry Point ---

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  console.log('╔══════════════════════════════════════╗');
  console.log('║   ⛓️  ChainForge Engine v0.1.0       ║');
  console.log('║   AI-Powered Blockchain Builder      ║');
  console.log('╚══════════════════════════════════════╝');

  let promptText = args.prompt as string | undefined;

  if (!promptText) {
    promptText = await promptUser(
      '\nDescribe your blockchain project (English or Indonesian):\n> ',
    );
  }

  if (!promptText) {
    console.error('❌ No prompt provided. Exiting.');
    process.exit(1);
  }

  try {
    await runPipeline({
      prompt: promptText,
      outputDir: (args.output as string) ?? './generated',
      deploy: args.deploy === true,
      privateKey: args['private-key'] as string | undefined,
      rpcUrl: (args.rpc as string) ?? 'https://rpc.sepolia.org',
    });
  } catch (err) {
    console.error('\n❌ Fatal error:', (err as Error).message);
    process.exit(1);
  }
}

// Run CLI when executed directly
main();
