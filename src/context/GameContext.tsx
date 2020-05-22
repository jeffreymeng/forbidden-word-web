import React, { ReactElement } from "react";

const GameContext = React.createContext({
  name: "",
  code: ""
});

export default function GameProvider(
  { children }: { children: ReactElement }): ReactElement {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");


  return (
    <GameContext.Provider value={{ name, setName, code, setCode }}>
      {children}
    </GameContext.Provider>
  );
}