"use client";
import { Box, Card, Callout, Tabs, Badge, Flex, Text } from "@radix-ui/themes";
import { ComponentProps, FC } from "react";
import { Address as AddressType } from "viem";
import { ExclamationTriangleIcon, ClockIcon } from "@radix-ui/react-icons";
import { AddressEntity } from "@/types";
import Address from "@/components/address";
import { useFavorites } from "@/providers/favorites";
import { useEntities } from "@/providers/entities";
import { useTimelockController } from "@/hooks/use-timelock-controller";
import { useTimelockOperations } from "@/hooks/use-timelock-operations";
import { useTimelockSigners } from "@/hooks/use-timelock-signers";
import Account from "../as/account";
import OperationsList from "./operations-list";
import SignersList from "./signers-list";

interface Props extends ComponentProps<typeof Card> {
  depth: number;
  address: AddressType;
  shortenAddress?: ComponentProps<typeof Address>["addreth"]["shortenAddress"];
  isLast: boolean;
}

const TimelockController: FC<Props> = ({
  address,
  shortenAddress,
  className,
  depth,
  isLast,
  ...props
}) => {
  const { isTimelockController, isLoading, proposerRole, executorRole, cancellerRole, minDelay } = 
    useTimelockController(address);
  const { operations, loading: operationsLoading } = useTimelockOperations();
  const { signers, loading: signersLoading } = useTimelockSigners();

  const { splice } = useEntities();
  const favorites = useFavorites();

  const formatDelay = (delay?: bigint) => {
    if (!delay) return "0";
    const seconds = Number(delay);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Account
      id={address}
      favorites={{
        toggle: () => {
          if (!favorites.isFavorite(AddressEntity.TimelockController, address)) {
            favorites.setFavorite([
              AddressEntity.TimelockController,
              {
                [address]: address,
              },
            ]);
          } else {
            favorites.removeFavorite(AddressEntity.TimelockController, address);
          }
        },
        isFavorite: favorites.isFavorite(AddressEntity.TimelockController, address),
      }}
      remove={() => splice(depth, 1)}
      entityType={AddressEntity.TimelockController}
      description="A TimelockController is a governance contract that enforces time delays on sensitive operations"
      address={address}
      className={className}
      shortenAddress={shortenAddress}
      isLast={isLast}
      {...props}
    >
      <Box>
        {!isTimelockController && !isLoading ? (
          <Callout.Root color="red" role="alert">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>
              This address does not appear to be a TimelockController contract.
            </Callout.Text>
          </Callout.Root>
        ) : isLoading ? (
          <Flex justify="center" align="center" p="4">
            <Text>Loading TimelockController data...</Text>
          </Flex>
        ) : (
          <>
            <Tabs.Root defaultValue="info">
              <Tabs.List>
                <Tabs.Trigger value="info">Info</Tabs.Trigger>
                <Tabs.Trigger value="roles">Roles</Tabs.Trigger>
                <Tabs.Trigger value="signers">Signers</Tabs.Trigger>
                <Tabs.Trigger value="operations">Operations</Tabs.Trigger>
              </Tabs.List>
              <Box pt="4" pb="2">
                <Tabs.Content value="info">
                  <Flex direction="column" gap="3">
                    <Flex align="center" gap="2">
                      <ClockIcon />
                      <Text weight="medium">Minimum Delay:</Text>
                      <Badge color="blue" size="2">
                        {formatDelay(minDelay)}
                      </Badge>
                    </Flex>
                    <Box>
                      <Text size="2" color="gray">
                        All operations must wait at least {formatDelay(minDelay)} between scheduling and execution.
                      </Text>
                    </Box>
                  </Flex>
                </Tabs.Content>
                <Tabs.Content value="roles">
                  <Flex direction="column" gap="3">
                    <Box>
                      <Text weight="medium" size="2">PROPOSER_ROLE</Text>
                      <Text size="1" color="gray" as="div">
                        Can schedule operations: {proposerRole}
                      </Text>
                    </Box>
                    <Box>
                      <Text weight="medium" size="2">EXECUTOR_ROLE</Text>
                      <Text size="1" color="gray" as="div">
                        Can execute ready operations: {executorRole}
                      </Text>
                    </Box>
                    <Box>
                      <Text weight="medium" size="2">CANCELLER_ROLE</Text>
                      <Text size="1" color="gray" as="div">
                        Can cancel pending operations: {cancellerRole}
                      </Text>
                    </Box>
                  </Flex>
                </Tabs.Content>
                <Tabs.Content value="signers">
                  <SignersList 
                    signers={signers} 
                    isLoading={signersLoading}
                  />
                </Tabs.Content>
                <Tabs.Content value="operations">
                  <OperationsList 
                    operations={operations} 
                    isLoading={operationsLoading}
                  />
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </>
        )}
      </Box>
    </Account>
  );
};

export default TimelockController;