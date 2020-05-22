import React from "react";

import Layout from "../components/layout";
import SEO from "../components/seo";
import { Link } from "gatsby";

const NotFoundPage = (): void => (
  <Layout noTitle>
    <SEO title="404: Not found"/>
    <h1>404</h1>
    <p>This page doesn&apos;t exist!</p>
    <Link to={"/"}>Back to home page</Link>
  </Layout>
);

export default NotFoundPage;
