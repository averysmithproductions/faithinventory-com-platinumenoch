# faithinventory-com-platinumenoch

[![faithinventory-com-platinumenoch badge](https://img.shields.io/badge/faithinventory.com-platinumenoch-%23b88e83?style=for-the-badge&logo=gatsby)](https://faithinventory.com/)

[<img title="ThalliumEli icon" src="https://user-images.githubusercontent.com/261457/85481153-4a511500-b58f-11ea-8020-ec01f0b878f9.png" width="90" />](https://github.com/averysmithproductions/faithinventory-com-infrastructure#diagram)

## Project Description

This is a the front-end website for [faithinventory.com](https://faithinventory.com).

PlatinumEnochStack is declared in the faithinventory-com-infrastructure repo.

It is a Gatsby generated site that provides a curated photo stream user experience similar Instagram and a blog user experience similar to Medium, or Wordpress.

The photo data is managed through ThalliumEli, which is FaithInventory's AWS API service.

Each time Gatsby is run, it fetches the photo stream data from ThalliumEli, and stores it as json at:
`src/data/auth/inventoryItems.json`.

PlatinumEnoch is hosted in an AWS S3 Bucket, and cached behind BariumNahum, FaithInventory's AWS CDN layer.

### Local Development

#### Initialize Repo

In order for local development to happen, Gatsby settings adjusted first. Please follow these steps:

1. install the project node modules:
`npm install`

**Since this repo uses nvm v13 or higher. If there is any trouble running the repo, simply run the following command:**

`nvm use` and then re-run `npm install`

2. Update the Gatsby `.env.development` and `.env.production` files with the following credentials:

```
AWS_ACCESS_KEY_ID=<awsAccessKeyId>
AWS_SECRET_ACCESS_KEY=<awsSecretAccessKey>
AWS_REGION=<awsRegion>
AWS_MEDIA_BUCKET=<environment>-platinumenoch-media
AWS_APP_BUCKET=<environment>-platinumenoch
HOSTNAME=[<environment>.]<domainName>
```

3. Seed Blog

This script seeds S3 with the image for PlatinumEnoch's first blog post.

`sh ./scripts/seed-blog.sh <environment> <awsProfile>`

4. Run Gatsby in development mode.

`gatsby develop`

Then re-run `gatsby develop`

### Deployment

#### For Lower Environment Deployments

`sh ./scripts/deploy.sh <environment> <awsProfile>`

This website is deployed via a pipeline of Github, Gatsby Cloud and AWS.

There are two types of site updates:
1. Content Updates (generally fast, conducted by an author)
2. App Updates (generally slow, conducted by a developer)

### Content Updates

There are two kinds of content updates: An inventory item update, and a blog post update.

## Managing an Inventory Item

To create, edit or delete an inventory item, the author must access:
<siteUrl>/author/items/.

When an author creates, edits, or deletes a inventory item, ThalliumEli notifies Gatsby Cloud, via a webhook, that data has changed. Gatsby Cloud then receives the notification and triggers a rebuild of the site. Gatsby is configured to make a new request to ThalliumEli, and receive the updated data, of which is stores in `src/data/auth/inventoryItems.json` and then continues to _incrementally_ build the site based on the new data.

Once the new build is complete, Gatsby is then configured to deploy the build to AWS S3.

Once the deployment is completed, BariumNahum needs to be notified to clear its cache. That is done by pressing the "Deploy Site Changes" button found at <siteUrl>/author/site-settings.

## Managing a Blog Post

To create, edit or delete a blog post, an author must access <siteUrl>/author/blog/.

...

### App Updates

An app update refers to the presentation and functional layer of the website. It is not necessarily the words and images that are accessed but really all of the look and feel that surrounds the words and images.

App updates are separate from content updates, and require a push to github in order to trigger a _full_ build on Gatsby Cloud. A full build is different than an incremental build, as Gatsby use its cached version of its previous full build. It forgoes that and generates a new full build.

A developer should open a terminal window and conduct the following commands:
```
git clone git@github.com:averysmithproductions/faithinventory-com-platinumenoch.git
cd faithinventory-com-platinumenoch
nvm use
npm install
gatsby develop
```
Gatsby will spin up a local server, something like "http://localhost:8000". You can access that url in your web browser,

Then in a separate terminal window cd into the faithinventory-com-platinumenoch directory again, and conduct your code changes.

Gatsby will hot-reload your changes into the web browser.

Once you are satisfied with your changes, turn off the local Gatsby server. To do that, navigate to the server terminal and press the keyboard combination, 'Control+C'.

Then run the following commands:

```
gatsby build
sh ./scripts/deploy.sh ...