import React from "react";
import { useQuery, createClient, cacheExchange, fetchExchange } from "urql";
import { Address } from "viem";
import { timelockEndpoint } from "@/config/env";

const timelockClient = createClient({
  url: timelockEndpoint.rootstock,
  exchanges: [cacheExchange, fetchExchange],
});

const TIMELOCK_OPERATIONS_QUERY = `
  query TimelockAllOperations {
    callScheduleds(
      orderBy: blockTimestamp
      orderDirection: desc
      first: 100
    ) {
      id
      internal_id
      index
      target
      value
      data
      predecessor
      delay
      blockNumber
      blockTimestamp
      transactionHash
    }
    callExecuteds(
      orderBy: blockTimestamp
      orderDirection: desc
      first: 100
    ) {
      id
      internal_id
      index
      target
      value
      data
      blockNumber
      blockTimestamp
      transactionHash
    }
    cancelleds(
      orderBy: blockTimestamp
      orderDirection: desc
      first: 100
    ) {
      id
      internal_id
      blockNumber
      blockTimestamp
      transactionHash
    }
    roleGranteds(
      orderBy: blockTimestamp
      orderDirection: desc
      first: 100
    ) {
      id
      role
      account
      sender
      blockNumber
      blockTimestamp
      transactionHash
    }
    roleRevokeds(
      orderBy: blockTimestamp
      orderDirection: desc
      first: 100
    ) {
      id
      role
      account
      sender
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const useTimelockOperations = () => {
  const [result, reexecuteQuery] = useQuery({
    query: TIMELOCK_OPERATIONS_QUERY,
    context: React.useMemo(() => ({ client: timelockClient }), []),
  });

  const { data, fetching, error } = result;

  // Combine and sort all operations by timestamp
  const operations = React.useMemo(() => {
    if (!data) return [];

    const allOps = [
      ...(data.callScheduleds?.map((op: any) => ({ ...op, type: 'scheduled' as const })) || []),
      ...(data.callExecuteds?.map((op: any) => ({ ...op, type: 'executed' as const })) || []),
      ...(data.cancelleds?.map((op: any) => ({ ...op, type: 'cancelled' as const })) || []),
      ...(data.roleGranteds?.map((op: any) => ({ ...op, type: 'role_granted' as const })) || []),
      ...(data.roleRevokeds?.map((op: any) => ({ ...op, type: 'role_revoked' as const })) || []),
    ];

    return allOps.sort((a: any, b: any) => Number(b.blockTimestamp) - Number(a.blockTimestamp));
  }, [data]);

  return {
    operations,
    loading: fetching,
    error,
    refetch: reexecuteQuery,
  };
};