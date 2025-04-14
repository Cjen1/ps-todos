import { type FC } from "react";

import { Dashboard } from "./components/dashboard/dashboard";

export const App : FC = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const token = searchParams.get('token');

  const protocol = window.location.protocol == 'https:' ? 'wss://' : 'ws://';
  const url = `${protocol}${window.location.host}/api/docs`;

  if (token !== null) {
    return <Dashboard token={token} url={url} />;
  } else {
    // TODO add a form and redirect
    return (
      <h1>Pass token to dashboard in URL</h1>
    );
  }
}