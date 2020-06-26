import React from "react"
import { SEO } from 'atoms'
import { Layout } from "organisms"

const NotFoundPage = () => (
  <Layout>
    <SEO title="This page doesn't exist on Faith Inventory" />
    <h1>NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </Layout>
)

export default NotFoundPage
