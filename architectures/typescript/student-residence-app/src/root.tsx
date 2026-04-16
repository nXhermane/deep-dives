import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Analytics } from "@vercel/analytics/react";

import "./app.css";

export const links = () => [
  {
    rel: "icon",
    href: "/icon-light-32x32.png",
    media: "(prefers-color-scheme: light)",
  },
  {
    rel: "icon",
    href: "/icon-dark-32x32.png",
    media: "(prefers-color-scheme: dark)",
  },
  {
    rel: "icon",
    href: "/icon.svg",
    type: "image/svg+xml",
  },
  { rel: "apple-touch-icon", href: "/apple-icon.png" },
];

export const meta = () => [
  { title: "StageProx - Affectation Optimale de Stages" },
  { name: "description", content: "Outil intelligent d'affectation de stages par proximite pour les etudiants de Cotonou. Classement optimal par distance residence-stage." },
  { name: "generator", content: "v0.app" },
];

export default function App() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans antialiased">
        <Outlet />
        <Analytics />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
