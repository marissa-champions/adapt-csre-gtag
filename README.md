# Google Analytics 4 for Adapt Framework

This plugin integrates [Google Analytics 4 (GA4)](https://developers.google.com/analytics) with the [Adapt Learning](https://www.adaptlearning.org/) framework. It allows for enhanced tracking of user interactions and learning behavior using Google Tag Manager (GTM) `dataLayer`.

> Originally based on [nachocinalli/adapt-gtag](https://github.com/nachocinalli/adapt-gtag), but modified and extended for internal use.
---

## Events Tracked

The following events are pushed to window.dataLayer for use with Google Tag Manager.

#### `courseLoaded`
Triggered when the course initializes.
- `courseTitle`: The title of the course
- `studentId`: Pulled from `_globals._learnerInfo.id` if available

#### `questionView:recordInteraction`
Triggered when a user answers a question.
- `courseTitle`: The title of the course
- `id`: The question's `_id`
- `title`: The question's title (if present)
- `response`: The learner's answer
- `result`: `true` or `false` for correct/incorrect
- `responseType`: Type of interaction

#### `tracking:complete`
Triggered when the course is marked complete.
- `courseTitle`: The title of the course
- `title`: The title of the course (same value; kept for GTM variables set up for 1.0.x)
- `status`: The course completion status (`passed`, `failed`, `incomplete`, etc.)

---

## Settings

- `_isEnabled`: turn tracking on for the course.
- `_measurementId`: the Google Tag Manager container ID (`GTM-…`). The name is kept from earlier versions so existing courses keep their value.
- `_injectSnippets` (default `true`): add the Tag Manager snippet to the page. Turn off only when the hosting page already loads the container.
- `_debug` (default `false`): log each event sent to `window.dataLayer` in the browser console.

## Upgrading from 1.0.x

The package name is still `adapt-gtag`, so the authoring tool upgrades the existing plugin in place.

1.0.x registered its `tracking:complete` and `questionView:recordInteraction` listeners twice, so each was pushed to the dataLayer twice. From 1.1.0 each is sent once, so counts in Google Analytics drop by about half after courses are republished.
