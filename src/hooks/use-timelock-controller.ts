import { useContractReads } from "wagmi";
import { Address } from "viem";

// TimelockController interface detection
const TIMELOCK_CONTROLLER_ABI = [
  {
    inputs: [],
    name: "PROPOSER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "EXECUTOR_ROLE", 
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CANCELLER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMinDelay",
    outputs: [{ internalType: "uint256", name: "duration", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "id", type: "bytes32" }],
    name: "getTimestamp",
    outputs: [{ internalType: "uint256", name: "timestamp", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "id", type: "bytes32" }],
    name: "isOperation",
    outputs: [{ internalType: "bool", name: "registered", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const useTimelockController = (address?: Address) => {
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address,
        abi: TIMELOCK_CONTROLLER_ABI,
        functionName: "PROPOSER_ROLE",
      },
      {
        address,
        abi: TIMELOCK_CONTROLLER_ABI,
        functionName: "EXECUTOR_ROLE",
      },
      {
        address,
        abi: TIMELOCK_CONTROLLER_ABI,
        functionName: "CANCELLER_ROLE",
      },
      {
        address,
        abi: TIMELOCK_CONTROLLER_ABI,
        functionName: "getMinDelay",
      },
    ],
    enabled: !!address,
  });

  const isTimelockController = !isError && data && data.every(result => result.status === "success");

  return {
    isTimelockController,
    isLoading,
    proposerRole: data?.[0]?.result as `0x${string}` | undefined,
    executorRole: data?.[1]?.result as `0x${string}` | undefined,
    cancellerRole: data?.[2]?.result as `0x${string}` | undefined,
    minDelay: data?.[3]?.result as bigint | undefined,
  };
};