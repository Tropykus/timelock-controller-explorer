"use client";

import { CircleIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Badge,
  Callout,
  DropdownMenu,
  Flex,
  TextField,
} from "@radix-ui/themes";
import { ComponentProps, FC, useEffect, useMemo, useState } from "react";
import { ACCOUNT_QUERY } from "./requests";
import { useDebounce } from "use-debounce";
import { isAddress } from "viem";
import { useQuery } from "urql";
import Address from "@/components/address";
import { postEvent } from "@/config/gtag";
import { useNetwork } from "wagmi";
import { cn } from "@/utils";
import Role from "@/components/role";
import { makeFragmentData, useFragment as asFragment } from "@/gql";
import { ACCESS_MANAGER_ROLE_FRAGMENT } from "@/components/role/requests";
import { useEntities } from "@/providers/entities";
import { AddressEntity } from "@/types";
import { EntityInstance } from "@/providers/entities/provider";
import { useTimelockController } from "@/hooks/use-timelock-controller";
const { Root, Slot, Input } = TextField;

interface Props extends ComponentProps<typeof Root> {
  input?: ComponentProps<typeof Input>;
  onNavigate?: (entity: EntityInstance) => void;
}

const Search: FC<Props> = ({ input, onNavigate = () => { }, ...props }) => {
  const [address, setAddress] = useState("");
  const { chain } = useNetwork();
  const [debouncedAddress] = useDebounce(address, 300);
  const [open, setOpen] = useState(false);
  const entities = useEntities();

  const isInputAddress = useMemo(
    () => isAddress(debouncedAddress),
    [debouncedAddress]
  );

  const [{ data, fetching }] = useQuery({
    query: ACCOUNT_QUERY,
    variables: {
      id: debouncedAddress,
    },
    pause: !isInputAddress,
  });

  const { isTimelockController, isLoading: timelockLoading } = useTimelockController(
    isInputAddress ? debouncedAddress as `0x${string}` : undefined
  );

  const { isData, isManager, isManaged, hasMembership, isTarget, hasResults } =
    useMemo(() => {
      const result = {
        account: false,
        isData: false,
        isManager: false,
        isManaged: false,
        hasMembership: false,
        isTarget: false,
        hasResults: false,
      };
      result.isData = !!data;

      if (!data?.account && !isTimelockController) return result;

      result.isManager = !!data?.account?.asAccessManager;
      result.isManaged = !!data?.account?.asAccessManaged;
      result.hasMembership = (data?.account?.membership?.length ?? 0) > 0;
      result.isTarget = (data?.account?.targettedBy?.length ?? 0) > 0;

      result.hasResults =
        result.isManager ||
        result.isManaged ||
        result.hasMembership ||
        result.isTarget ||
        !!isTimelockController;

      return result;
    }, [data, isTimelockController]);

  useEffect(() => {
    setOpen(isInputAddress && (isData || !!isTimelockController));
  }, [isData, data, isInputAddress, address, isTimelockController]);

  const clearAndReset = (entity: EntityInstance) => {
    const inputs = entity.id.split("/", 3);
    postEvent({ account: inputs[2], manager: inputs[0], hasRole: inputs[1] }, 'search', chain?.name ?? 'none');

    entities.clearAndPush(entity);
    setAddress("");
    onNavigate(entity);
  };

  return (
    <Root {...props}>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger>
          <button
            style={{
              visibility: "hidden",
            }}
          />
        </DropdownMenu.Trigger>
        <Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </Slot>
        <Input
          {...input}
          onChange={(event) => setAddress(event.target.value)}
          value={address}
        />
        <DropdownMenu.Content>
          {!hasResults && (
            <Callout.Root color="gray">
              <Callout.Icon>
                <CircleIcon />
              </Callout.Icon>
              <Callout.Text>
                No information found for this address.
              </Callout.Text>
            </Callout.Root>
          )}
          {isManager && (
            <DropdownMenu.Item
              onClick={() =>
                clearAndReset({
                  type: AddressEntity.AccessManager,
                  id: data?.account?.asAccessManager?.id,
                })
              }
            >
              <Address
                hidePopup
                addreth={{
                  shortenAddress: false,
                  actions: "none",
                  address: data?.account?.asAccessManager?.id,
                }}
              />
              <Badge color="amber" ml="auto" size="1" variant="solid">
                Manager
              </Badge>
            </DropdownMenu.Item>
          )}
          {isTimelockController && (
            <DropdownMenu.Item
              onClick={() =>
                clearAndReset({
                  type: AddressEntity.TimelockController,
                  id: debouncedAddress,
                })
              }
            >
              <Address
                hidePopup
                addreth={{
                  shortenAddress: false,
                  actions: "none",
                  address: debouncedAddress as `0x${string}`,
                }}
              />
              <Badge color="blue" ml="auto" size="1" variant="solid">
                Timelock
              </Badge>
            </DropdownMenu.Item>
          )}
          {isManaged && (
            <DropdownMenu.Item
              id={data?.account?.asAccessManaged?.id}
              onClick={() =>
                clearAndReset({
                  type: AddressEntity.AccessManaged,
                  id: data?.account?.asAccessManaged?.id,
                })
              }
            >
              <Flex mr="2">
                <Address
                  hidePopup
                  addreth={{
                    shortenAddress: false,
                    actions: "none",
                    address: data?.account?.asAccessManaged?.id,
                  }}
                />
              </Flex>
              <Badge color="amber" ml="auto" size="1" variant="solid">
                Managed
              </Badge>
            </DropdownMenu.Item>
          )}
          {hasMembership && (
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>Member of</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                {data?.account?.membership.map((membership) => {
                  const role = asFragment(
                    ACCESS_MANAGER_ROLE_FRAGMENT,
                    membership.role
                  );
                  return (
                    <DropdownMenu.Item
                      key={membership.id}
                      onClick={() =>
                        clearAndReset({
                          type: AddressEntity.AccessManagerRoleMember,
                          id: membership.id,
                        })
                      }
                    >
                      <Flex mr="6">
                        <Address
                          hidePopup
                          addreth={{
                            actions: "none",
                            shortenAddress: 6,
                            address: membership.manager.asAccount.id,
                          }}
                        />
                      </Flex>
                      <Role
                        mr="2"
                        accessManagerRole={makeFragmentData(
                          {
                            id: role.id,
                            asRole: {
                              id: role.label ?? role.asRole.id,
                            },
                          },
                          ACCESS_MANAGER_ROLE_FRAGMENT
                        )}
                      />
                      <Badge color="amber" ml="auto" size="1" variant="solid">
                        Role member
                      </Badge>
                    </DropdownMenu.Item>
                  );
                })}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          )}
          {isTarget && (
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>Managed by</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                {data?.account?.targettedBy.map((targettedBy) => (
                  <DropdownMenu.Item
                    key={targettedBy.id}
                    onClick={() =>
                      clearAndReset({
                        type: AddressEntity.AccessManagerTarget,
                        id: targettedBy.id,
                      })
                    }
                  >
                    <Flex mr="2">
                      <Address
                        hidePopup
                        addreth={{
                          actions: "none",
                          shortenAddress: 6,
                          address: targettedBy.manager.asAccount.id,
                        }}
                      />
                    </Flex>
                    <Badge color="amber" ml="auto" size="1" variant="solid">
                      Target
                    </Badge>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <Slot>
        <div
          className={cn(
            "animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent text-gray-600 rounded-full",
            {
              invisible: !fetching && !timelockLoading,
            }
          )}
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </Slot>
    </Root>
  );
};

export default Search;
