"use client";
import { Box, Table, Badge, Text, Flex } from "@radix-ui/themes";
import { FC } from "react";
import Address from "@/components/address";

interface Signer {
  address: string;
  roles: string[];
  grantedAt: string;
  revokedAt?: string;
}

interface Props {
  signers: Signer[];
  isLoading?: boolean;
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

// Role constants - these are the keccak256 hashes of the role names
const ROLES = {
  '0x0000000000000000000000000000000000000000000000000000000000000000': 'DEFAULT_ADMIN_ROLE',
  '0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1': 'PROPOSER_ROLE',
  '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63': 'EXECUTOR_ROLE',
  '0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783': 'CANCELLER_ROLE',
} as const;

const getRoleBadgeColor = (role: string) => {
  const roleName = formatRoleName(role);
  switch (roleName) {
    case 'PROPOSER_ROLE': return 'blue';
    case 'EXECUTOR_ROLE': return 'green';
    case 'CANCELLER_ROLE': return 'orange';
    case 'DEFAULT_ADMIN_ROLE': return 'purple';
    default: return 'gray';
  }
};

const formatRoleName = (role: string) => {
  // Check if it's a known role hash
  if (ROLES[role as keyof typeof ROLES]) {
    return ROLES[role as keyof typeof ROLES];
  }
  
  // If it's already a readable name, return it
  if (role.includes('_ROLE')) {
    return role;
  }
  
  // Otherwise return the hex string
  return role;
};

const SignersList: FC<Props> = ({ signers, isLoading }) => {
  if (isLoading) {
    return (
      <Flex justify="center" align="center" p="4">
        <Text>Loading signers...</Text>
      </Flex>
    );
  }

  if (signers.length === 0) {
    return (
      <Flex justify="center" align="center" p="4">
        <Text color="gray">No signers found</Text>
      </Flex>
    );
  }

  return (
    <Box>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell style={{ width: '200px' }}>Address</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell style={{ width: '300px' }}>Roles</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell style={{ width: '150px' }}>Granted</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell style={{ width: '150px' }}>Status</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {signers.map((signer) => (
            <Table.Row key={signer.address}>
              <Table.Cell>
                <Address
                  addreth={{ 
                    address: signer.address as `0x${string}`,
                    shortenAddress: 6 
                  }}
                />
              </Table.Cell>
              <Table.Cell>
                <Flex gap="1" wrap="wrap">
                  {signer.roles.map((role) => {
                    const roleName = formatRoleName(role);
                    const displayName = roleName
                      .replace('_ROLE', '')
                      .replace('DEFAULT_ADMIN', 'Admin')
                      .replace('PROPOSER', 'Proposer')
                      .replace('EXECUTOR', 'Executor')
                      .replace('CANCELLER', 'Canceller');
                    
                    return (
                      <Badge key={role} color={getRoleBadgeColor(role)} size="1">
                        {displayName}
                      </Badge>
                    );
                  })}
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <Text size="1">
                  {formatTimestamp(signer.grantedAt)}
                </Text>
              </Table.Cell>
              <Table.Cell>
                {signer.revokedAt ? (
                  <Badge color="red" size="1">Revoked</Badge>
                ) : (
                  <Badge color="green" size="1">Active</Badge>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default SignersList; 