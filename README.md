# Gatsby Plugin Revision
Let's say you have a big site, or a very sensative site. You deployed your content and then a week or two passes and 
you need to add content. There's might be a case where you deleted very important content or changed something very 
sensitive.

One way to solve this is before working on the content you'll make a revision. The revision is kind of snapshot that 
will insure that in case you made a mistake you can bring back the site as it was, deploy it in less then a minute and 
you'll be able to work on the content and deliver the new content with the fixes.

## Installation

Install the package from:

```bash
npm i gatsby-plugin-revisions
```

In the `gatsby-config.js` add the plugin to the list of plugins:

```js
module.exports = {
  plugins: [`gatsby-plugin-revisions`]
}
```

## Endpoints

There are a couple of interactions:

### Creating a revision
```REST
POST http://localhost:8000/revision
```

Which will return 

``json
{
    "message": "Revision has created",
    "revisionId": 1592051189330
}
``

### Get a list of revisions
```REST
GET http://localhost:8000/revisions
```

Which will return 

``json
[
    "1592042752916",
    "1592051189330"
]
``

### Revert to a revision
```REST
POST http://localhost:8000/revision-revert/:revision-id

    * :revision-id: The number of the revision.
```

Which will return 

``json
{
    "message": "The revision 1592051189330 has been reverted."
}
``
