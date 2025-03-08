import { type FC, useEffect, useState } from "react";
import styles from "./App.module.css";
import { YTask } from "./types.ts"; 

const useConnState = (provider) => {
    const [connState, setConnState] = useState<ProviderConnStatus>({kind: "Connecting"});
    useEffect(()=>{
        provider.on("connect", ()=>setConnState({kind: "Connected"}));
        provider.on("disconnect", ()=>setConnState({kind: "Connecting"}));
        provider.on("authenticated", ()=>setConnState({kind: "Authenticated"}));
        provider.on("authenticationFailed", (reason : string)=>setConnState({kind:"AuthFailed", reason:reason})) ;
    }, []);
    useEffect(()=> console.log(connState), [connState]);
}

const searchParams = new URLSearchParams(window.location.search)
const docId = searchParams.get('id')

const App: FC = () => {
  if (docId) {

}
