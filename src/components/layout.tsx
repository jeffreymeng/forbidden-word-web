import React, { ReactElement } from "react";

import { Container } from "react-bootstrap";

const Layout = ({ children, noTitle, showSubtitle }: {
  children: React.ReactNode;
  noTitle?: boolean;
  showSubtitle?: boolean;
}): ReactElement => {

  return (
    <>
      <Container className={"pt-5"} id={"site-container"} style={{
        maxWidth: 800
      }}>
        {(!noTitle) && <>
          <h1 className={"text-center"}>Forbidden Words</h1>
          {showSubtitle && <><p className="text-muted text-center">A game of ulterior motives and fake conversations.</p><hr/></>}

        </>}
        {children}
        <div className="push"/>
      </Container>
      <footer className={"text-center"}>
        <p className="text-muted">
          Copyright &copy; 2020 Jeffrey Meng <br/>
          Forbidden Words is made with <a href={"https://gatsbyjs.com"} target={"_blank"}
                                          rel={"noopener noreferrer"}>Gatsby</a>, <a
          href={"https://firebase.google.com"} target={"_blank"} rel={"noopener noreferrer"}>Firebase</a>, and <a
          href={"https://react-bootstrap.github.io"} target={"_blank"} rel={"noopener noreferrer"}>React Bootstrap</a>.
          <br/>
          <a href={"https://github.com/jeffreymeng/forbidden-words"} target={"_blank"}
             rel={"noopener noreferrer"}>https://github.com/jeffreymeng/forbidden-words</a>
        </p>
      </footer>
    </>
  );
};

export default Layout;
