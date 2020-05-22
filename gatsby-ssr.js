/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

import React from "react";
import "./src/styles/site.scss";
import GameProvider from "./src/context/GameContext";

// eslint-disable-next-line react/prop-types
export const wrapRootElement = ({ element }) => (
  <GameProvider>{element}</GameProvider>
);