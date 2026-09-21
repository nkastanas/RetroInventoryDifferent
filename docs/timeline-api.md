# Timeline API

The collection timeline is publicly readable through GraphQL. Creating, editing, and deleting historical events requires the same administrator access token used by the web application.

## Event fields

| Field | Required on create | Description |
| --- | --- | --- |
| `year` | Yes | Display year from `0` through `9999` |
| `title` | Yes | Short event heading |
| `description` | Yes | Event summary |
| `type` | Yes | `IBM`, `DOS`, `WINDOWS`, `LINUX`, or `PC_INDUSTRY` |
| `sortOrder` | No | Order among events in the same year; defaults to `0` |
| `titleDe`, `descriptionDe` | No | German translation |
| `titleFr`, `descriptionFr` | No | French translation |

Empty optional translation strings are stored as `null`, causing the UI to fall back to English.

## Authentication

Obtain an access token from the API:

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}
```

Send the returned token with mutations:

```http
Authorization: Bearer ACCESS_TOKEN
```

## Read events

Reading remains public:

```graphql
query TimelineEvents {
  timelineEvents {
    id
    year
    title
    description
    type
    sortOrder
    titleDe
    descriptionDe
    titleFr
    descriptionFr
  }
}
```

Events are returned by year and then by `sortOrder`.

## Create an event

```graphql
mutation CreateTimelineEvent {
  createTimelineEvent(input: {
    year: 1981
    title: "IBM Personal Computer 5150 introduced"
    description: "IBM launches the original PC and establishes an industry standard."
    type: IBM
    sortOrder: 0
  }) {
    id
    year
    title
    type
    sortOrder
  }
}
```

## Update an event

Only the supplied fields are changed:

```graphql
mutation UpdateTimelineEvent {
  updateTimelineEvent(input: {
    id: 1
    description: "Updated historical description."
    sortOrder: 1
  }) {
    id
    description
    sortOrder
  }
}
```

## Delete an event

Deletion is permanent:

```graphql
mutation DeleteTimelineEvent {
  deleteTimelineEvent(id: 1)
}
```

Deleting a historical event does not modify inventory devices. Default PC-history events are migration-managed and are not recreated by later seed runs.
