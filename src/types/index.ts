import { chains } from "@/config/chains";

export enum AddressEntity {
  AccessManager = "Access Manager",
  AccessManaged = "Access Managed",
  AccessManagerTarget = "Target",
  AccessManagerRoleMember = "Role member",
  TimelockController = "Timelock Controller",
}

export enum Entity {
  AccessManagerTargetFunction = "Function",
  AccessManagerRole = "Role",
  AccessManagerOperation = "Operation",
  TimelockOperation = "Timelock Operation",
}

export type SupportedChain = (typeof chains)[number];
export type SupportedChainDefinition = SupportedChain["definition"];
export type SupportedChainId = SupportedChainDefinition["id"];
