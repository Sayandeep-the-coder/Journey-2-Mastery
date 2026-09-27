import { db } from '../lib/db/client';
import { tasks, users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const user = await db.query.users.findFirst();
  if (!user) {
    console.error('No user found');
    process.exit(1);
  }

  const existing = await db.query.tasks.findFirst({
    where: eq(tasks.title, 'ERC-20 Staking Protocol'),
  });

  if (existing) {
    console.log('Sample Web3 task already exists with ID:', existing.id);
    process.exit(0);
  }

  const [sampleTask] = await db
    .insert(tasks)
    .values({
      title: 'ERC-20 Staking Protocol',
      shortDescription: 'Design and deploy a decentralized ERC-20 staking and reward distribution smart contract.',
      description: '# ERC-20 Staking Protocol\n\nBuild an on-chain staking vault where users deposit ERC-20 tokens and accrue rewards over time with proportional distribution.',
      requirements: '### Technical Requirements\n\n- Solidity ^0.8.20\n- Reentrancy protection\n- Gas-optimized mathematical calculations for continuous reward rate\n- Comprehensive Foundry/Hardhat test suite',
      track: 'web3',
      taskType: 'Smart Contract',
      category: 'Web3',
      difficulty: 'medium',
      rankRequired: 'Ronin',
      points: 150,
      bonusPoints: 25,
      passingScore: 50,
      createdBy: user.id,
      criteria: [
        { id: 'security', name: 'Contract Security & Safety', maxScore: 25, description: 'Reentrancy guards, access controls, audit rigor' },
        { id: 'gasOptimization', name: 'Gas Efficiency & Performance', maxScore: 20, description: 'Optimized storage, opcode efficiency, calldata usage' },
        { id: 'functionality', name: 'Protocol & Logic Correctness', maxScore: 25, description: 'Smart contract methods, state transitions, events' },
        { id: 'testing', name: 'Testing (Hardhat / Foundry)', maxScore: 15, description: 'Fuzzing, unit and integration test coverage' },
        { id: 'documentation', name: 'Documentation & NatSpec', maxScore: 15, description: 'NatSpec comments, diagram, deployment instructions' },
      ],
      isActive: true,
    })
    .returning();

  console.log('✅ Created sample Web3 task successfully:', sampleTask.id);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error seeding Web3 sample task:', err);
  process.exit(1);
});
