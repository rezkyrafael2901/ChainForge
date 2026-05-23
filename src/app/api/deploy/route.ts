import { NextResponse } from 'next/server'
import { ProjectSpec } from '@/types'
import { generateDeployableERC20 } from '@/lib/deployable'

export const runtime = 'nodejs'

type SolcOutput = {
  errors?: Array<{ severity: 'error' | 'warning'; formattedMessage: string; message: string }>
  contracts?: Record<string, Record<string, { abi: any[]; evm: { bytecode: { object: string } } }>>
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const spec = body.spec as ProjectSpec | undefined

    if (!spec) {
      return NextResponse.json({ error: 'Project spec is required' }, { status: 400 })
    }

    if (spec.type !== 'token') {
      return NextResponse.json({
        error: 'Direct deploy currently supports ERC-20 tokens only',
        supported: ['token'],
        fallback: 'Use Download ZIP or Remix-assisted deploy for this project type.',
      }, { status: 400 })
    }

    const source = generateDeployableERC20(spec)
    const contractName = safeContractName(spec.name || 'BlockPilotToken')

    // Dynamic import keeps solc server-side only
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const solc = require('solc')

    const input = {
      language: 'Solidity',
      sources: {
        [`${contractName}.sol`]: { content: source },
      },
      settings: {
        optimizer: { enabled: true, runs: 200 },
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode.object'],
          },
        },
      },
    }

    const output = JSON.parse(solc.compile(JSON.stringify(input))) as SolcOutput

    const errors = output.errors?.filter(e => e.severity === 'error') || []
    const warnings = output.errors?.filter(e => e.severity === 'warning') || []

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Compilation failed',
        errors: errors.map(e => e.formattedMessage || e.message),
        source,
      }, { status: 500 })
    }

    const contract = output.contracts?.[`${contractName}.sol`]?.[contractName]
    if (!contract?.evm?.bytecode?.object) {
      return NextResponse.json({
        error: 'No bytecode generated',
        source,
      }, { status: 500 })
    }

    const bytecode = `0x${contract.evm.bytecode.object}`

    return NextResponse.json({
      success: true,
      contractName,
      type: spec.type,
      chain: spec.chain,
      source,
      abi: contract.abi,
      bytecode,
      bytecodeSize: Math.round((bytecode.length - 2) / 2),
      warnings: warnings.map(w => w.formattedMessage || w.message),
      estimatedGas: 'Will be estimated by wallet',
      constructorArgs: [], // Self-contained ERC20 constructor has no args
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to compile deployment package', details: String(error) },
      { status: 500 }
    )
  }
}

function safeContractName(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '') || 'BlockPilotToken'
  return /^[A-Za-z]/.test(cleaned) ? cleaned : `Token${cleaned}`
}
