import { type FC, useEffect, useState } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";

type ProviderConnStatus =
  { kind: "Connecting" | "Authenticated" | "Connected" } |
  { kind: "AuthFailed"; reason: string };

const useConnState = (provider: HocuspocusProvider) => {
  const [connState, setConnState] = useState<ProviderConnStatus>({ kind: "Connecting" });
  useEffect(() => {
    provider.on("connect", () => setConnState({ kind: "Connected" }));
    provider.on("disconnect", () => setConnState({ kind: "Connecting" }));
    provider.on("authenticated", () => setConnState({ kind: "Authenticated" }));
    provider.on("authenticationFailed", (reason: string) => setConnState({ kind: "AuthFailed", reason: reason }));
  }, []);
  useEffect(() => console.log(connState), [connState]);
  return connState;
}

export const ProviderState: FC<{ provider: HocuspocusProvider | undefined }> = ({ provider }) => {
  if (provider) {
    const connState = useConnState(provider);
    return (
      <div className="text">{JSON.stringify(connState)}</div>
    );
  } else {
    <div>Not connected</div>
  }
}