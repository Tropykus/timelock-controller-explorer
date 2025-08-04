import React from "react";
import { useQuery, createClient, cacheExchange, fetchExchange } from "urql";
import { Address } from "viem";
import { timelockEndpoint } from "@/config/env";

const timelockClient = createClient({
  url: timelockEndpoint.rootstock,
  exchanges: [cacheExchange, fetchExchange],
});

const TIMELOCK_SIGNERS_QUERY = `
  query TimelockSigners {
    roleGranteds(
      orderBy: blockTimestamp
      orderDirection: asc
      first: 1000
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
      orderDirection: asc
      first: 1000
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

interface Signer {
  address: string;
  roles: string[];
  grantedAt: string;
  revokedAt?: string;
}

export const useTimelockSigners = () => {
  const [result, reexecuteQuery] = useQuery({
    query: TIMELOCK_SIGNERS_QUERY,
    context: React.useMemo(() => ({ client: timelockClient }), []),
  });

  const { data, fetching, error } = result;

  // Process role events to determine current signers
  const signers = React.useMemo(() => {
    if (!data) return [];

    const roleGranteds = data.roleGranteds || [];
    const roleRevokeds = data.roleRevokeds || [];

    // Create a map to track role assignments over time
    const roleHistory = new Map<string, { roles: Set<string>, grantedAt: string, revokedAt?: string }>();

    // Process role granted events
    roleGranteds.forEach((event: any) => {
      const { account, role, blockTimestamp } = event;
      const key = account.toLowerCase();
      
      if (!roleHistory.has(key)) {
        roleHistory.set(key, { 
          roles: new Set(), 
          grantedAt: blockTimestamp,
          revokedAt: undefined 
        });
      }
      
      const signer = roleHistory.get(key)!;
      signer.roles.add(role);
    });

    // Process role revoked events
    roleRevokeds.forEach((event: any) => {
      const { account, role, blockTimestamp } = event;
      const key = account.toLowerCase();
      
      if (roleHistory.has(key)) {
        const signer = roleHistory.get(key)!;
        signer.roles.delete(role);
        
        // If no roles left, mark as revoked
        if (signer.roles.size === 0) {
          signer.revokedAt = blockTimestamp;
        }
      }
    });

    // Convert to array format
    const currentSigners: Signer[] = [];
    roleHistory.forEach((signer, address) => {
      if (signer.roles.size > 0) {
        currentSigners.push({
          address,
          roles: Array.from(signer.roles),
          grantedAt: signer.grantedAt,
          revokedAt: signer.revokedAt
        });
      }
    });

    return currentSigners.sort((a, b) => Number(a.grantedAt) - Number(b.grantedAt));
  }, [data]);

  return {
    signers,
    loading: fetching,
    error,
    refetch: reexecuteQuery,
  };
}; 