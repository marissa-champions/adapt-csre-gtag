# Google Analytics 4 for Adapt Framework

This plugin integrates [Google Analytics 4 (GA4)](https://developers.google.com/analytics) with the [Adapt Learning](https://www.adaptlearning.org/) framework. It allows for enhanced tracking of user interactions and learning behavior using the GA4 `gtag.js` or Google Tag Manager (GTM) `dataLayer`.

> Originally based on [nachocinalli/adapt-gtag](https://github.com/nachocinalli/adapt-gtag), but modified and extended for internal use.
---

## 📡 Events Tracked

The following events are pushed to `window.dataLayer` or sent via `gtag()`

### `courseLoaded`
Triggered when the course initializes.
- `courseTitle`: The title of the course
- `studentId`: Pulled from `_globals._learnerInfo.id` if available

### `questionView:recordInteraction`
Triggered when a user answers a question.
- `courseTitle`: The title of the course
- `id`: The question's `_id`
- `title`: The question's title (if present)
- `response`: The learner's answer
- `result`: `true` or `false` for correct/incorrect
- `responseType`: Type of interaction (or `'unknown'`)

### `tracking:complete`
Triggered when the course is marked complete.
- `courseTitle`: The title of the course
- `status`: The course completion status (`passed`, `failed`, `incomplete`, etc.)

---
