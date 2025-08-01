"use client";
import { Theme as Themes } from "@radix-ui/themes";
import { FC, ReactNode, useMemo } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Provider } from "urql";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { chains } from "@/config/wallet";
import { chains as suportedChains } from "@/config/chains";
import { getUrqlClient } from "@/config/urql";
import { useRouteNetwork } from "@/providers/route-network";

interface Props {
  children: ReactNode;
}

const Theme: FC<Props & { suppressHydrationWarning?: boolean }> = ({ children, suppressHydrationWarning }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableSystem={false}
      storageKey="access-manager-theme"
    >
      <Themes accentColor="blue" suppressHydrationWarning={suppressHydrationWarning}>
        {children}
      </Themes>
    </ThemeProvider>
  );
};

const Urql: FC<Props> = ({ children }) => {
  const { currentChain } = useRouteNetwork();

  const client = useMemo(() => {
    const supportedChain = suportedChains.find(
      ({ definition }) => definition.id == currentChain.id
    );
    if (!supportedChain) return;
    return getUrqlClient(supportedChain);
  }, [currentChain.id]);

  if (!client) return <></>;

  return <Provider value={client}>{children}</Provider>;
};

const RainbowKit: FC<Props> = ({ children }) => {
  const { theme, resolvedTheme } = useTheme();
  
  // Prevent hydration mismatch by using a stable theme on first render
  const rainbowTheme = resolvedTheme === "dark" || theme === "dark" ? darkTheme() : undefined;
  
  return (
    <RainbowKitProvider
      theme={rainbowTheme}
      chains={chains}
      showRecentTransactions={true}
    >
      {children}
    </RainbowKitProvider>
  );
};

export { Theme, Urql, RainbowKit };
