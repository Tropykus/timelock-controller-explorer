"use client";
import { Box, Table, Badge, Text, Flex, IconButton } from "@radix-ui/themes";
import { FC } from "react";
import * as React from "react";
import { CopyIcon } from "@radix-ui/react-icons";
import Address from "@/components/address";
import { useClipboard } from "@/hooks/use-clipboard";

interface Operation {
  id: string;
  type: 'scheduled' | 'executed' | 'cancelled' | 'role_granted' | 'role_revoked';
  blockTimestamp: string;
  transactionHash: string;
  target?: string;
  value?: string;
  data?: string;
  delay?: string;
  role?: string;
  account?: string;
  sender?: string;
}

interface Props {
  operations: Operation[];
  isLoading?: boolean;
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

const formatValue = (value?: string) => {
  if (!value || value === "0") return "0 ETH";
  const eth = Number(value) / 10**18;
  return `${eth.toFixed(4)} ETH`;
};

const truncateData = (data?: string, maxLength = 20) => {
  if (!data) return "-";
  if (data.length <= maxLength) return data;
  return `${data.slice(0, maxLength)}...`;
};

const getOperationBadgeColor = (type: Operation['type']) => {
  switch (type) {
    case 'scheduled': return 'yellow';
    case 'executed': return 'green';
    case 'cancelled': return 'red';
    case 'role_granted': return 'blue';
    case 'role_revoked': return 'orange';
    default: return 'gray';
  }
};

const formatOperationType = (type: Operation['type']) => {
  switch (type) {
    case 'scheduled': return 'Scheduled';
    case 'executed': return 'Executed';
    case 'cancelled': return 'Cancelled';
    case 'role_granted': return 'Role Granted';
    case 'role_revoked': return 'Role Revoked';
    default: return type;
  }
};

const DataCell: FC<{ data?: string; operationType?: string }> = ({ data, operationType }) => {
  // Use a callback to copy the full data, not the truncated version
  const copyToClipboard = React.useCallback(async () => {
    if (data) {
      try {
        await navigator.clipboard.writeText(data);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = data;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    }
  }, [data]);

  const [hasCopied, setHasCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    await copyToClipboard();
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 1500);
  }, [copyToClipboard]);

  // Show copy button for any data payload, even if it's just "0x"
  // The only case we don't show it is when data is completely missing/undefined
  if (!data) {
    // Show helpful message for operation types that don't have data payloads
    const noDataTypes = ['cancelled', 'role_granted', 'role_revoked'];
    const hasNoDataPayload = operationType && noDataTypes.includes(operationType);
    
    return (
      <Text size="1" color={hasNoDataPayload ? "gray" : undefined}>
        {hasNoDataPayload ? "N/A" : "-"}
      </Text>
    );
  }

  // For very short data like "0x", still show the copy button but indicate it's empty
  const displayText = data === "0x" ? "0x (empty)" : truncateData(data);

  return (
    <Flex align="center" gap="1">
      <Text size="1" style={{ fontFamily: 'monospace' }}>
        {displayText}
      </Text>
      <IconButton
        size="1"
        variant="ghost"
        color={hasCopied ? "green" : "gray"}
        onClick={handleCopy}
        title={`Copy full payload data (${data.length} chars)`}
      >
        <CopyIcon width="12" height="12" />
      </IconButton>
    </Flex>
  );
};

const OperationsList: FC<Props> = ({ operations, isLoading }) => {

  if (isLoading) {
    return (
      <Flex justify="center" align="center" p="4">
        <Text>Loading operations...</Text>
      </Flex>
    );
  }

  if (operations.length === 0) {
    return (
      <Flex justify="center" align="center" p="4">
        <Text color="gray">No operations found</Text>
      </Flex>
    );
  }

  return (
    <Box>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Target/Account</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Value/Role</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Data Payload</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Tx Hash</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {operations.map((operation) => (
            <Table.Row key={operation.id}>
              <Table.Cell>
                <Badge color={getOperationBadgeColor(operation.type)} size="1">
                  {formatOperationType(operation.type)}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {operation.target && (
                  <Address
                    addreth={{ 
                      address: operation.target as `0x${string}`,
                      shortenAddress: 4 
                    }}
                  />
                )}
                {operation.account && (
                  <Address
                    addreth={{ 
                      address: operation.account as `0x${string}`,
                      shortenAddress: 4 
                    }}
                  />
                )}
                {!operation.target && !operation.account && "-"}
              </Table.Cell>
              <Table.Cell>
                {operation.value && formatValue(operation.value)}
                {operation.role && (
                  <Text size="1" style={{ fontFamily: 'monospace' }}>
                    {truncateData(operation.role, 12)}
                  </Text>
                )}
                {!operation.value && !operation.role && "-"}
              </Table.Cell>
              <Table.Cell>
                <DataCell data={operation.data} operationType={operation.type} />
              </Table.Cell>
              <Table.Cell>
                <Text size="1">
                  {formatTimestamp(operation.blockTimestamp)}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text size="1" style={{ fontFamily: 'monospace' }}>
                  <a
                    href={`https://rootstock.blockscout.com/tx/${operation.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-9)' }}
                  >
                    {truncateData(operation.transactionHash, 12)}
                  </a>
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default OperationsList;