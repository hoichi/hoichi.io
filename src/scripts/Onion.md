I think the onion levels are as follows:

## Core ##

Pure ~~bliss~~ domain types and logic. Encodes information, doesn’t care about presentation or IO.

## View ##

What’s visible to user: presentation, navigation &c. No care in the world about mundane things like persistence.

## IO ##

Knows of both core and view, because it implements backend for both. E.g., gets paths (View) for posts (core) to write them to html files.
