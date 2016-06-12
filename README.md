<img src="images/icon.png" width="70"/>Hackable [YoruFukurou](https://sites.google.com/site/yorufukurou/home-en) Alternative
=====================================================================================

This is a Twitter client to aim to replace YoruFukurou with high pluggablity.  Under construction.

Goals :bird::

- Perspicuity
  - Display as many tweets on timeline as possible
  - Height of app is most important for timeline
- Everything can be done with keyboard
  - All actions can be done with key shortcuts
  - Flexible and customizable keybindings system
- High performance timeline management
- Plugin architecture
  - Hooks for each Twitter activities and notification
  - Enable to add other timelines rather than Twitter using React component
- Layout customization using CSS
  - Automatically loads `user.css` in data directory
- Cross platform (OS X, Windows, Linux)
- **Not a clone, but an alternative**

## Application Directory

- OS X: `~/Library/Application\ Support/YourFukurou/`
- Linux: `~/.config/YourFukurou/`
- Windows: `%APPDATA%\YourFukurou\`.

## User CSS

You can specify your favorite styling by putting `user.css` in the application directory.

To look up class names, you can use Chrome DevTools.  You can open DevTools from menu or setting `NODE_ENV` environment variable to 'development'.

## Drawer Timeline

You can see temporary timeline (e.g. user specific tweets) in drawer.  When you click icon in tweets or screen name or icon in profile popup, the user information and the user's tweets are shown in drawer.  Keybind is switched from global keybinds to drawer timeline keybinds.

## Keyboard Shortcuts

There are some keyboard shortcut contexts.  They can be customizable by action name (Please see below 'JSON Configuration File' section).

### Global Shortcuts

These shortcuts are applied by default.  If no shortcut is matched to the input, it will be handled by system's default manner.

| Default  | Description                                | Action Name        |
|----------|--------------------------------------------|--------------------|
| `tab`    | Open tweet form.                           | `open-tweet-form`  |
| `i`      | Move focus to top.                         | `focus-top`        |
| `j`      | Move focus to next.                        | `focus-next`       |
| `k`      | Move focus to previous.                    | `focus-previous`   |
| `m`      | Move focus to bottom.                      | `focus-bottom`     |
| `o`      | Open picture preview in focused tweet.     | `open-media`       |
| `O`      | Open focused tweet page in browser.        | `open-status-page` |
| `l`      | Open all links in focused tweet.           | `open-links`       |
| `1`      | Switch to home timeline.                   | `home-timeline`    |
| `2`      | Switch to mention timeline.                | `mention-timeline` |
| `ctrl+r` | Retweet focused tweet.                     | `retweet`          |
| `ctrl+f` | Like focused tweet.                        | `like`             |
| `ctrl+D` | Delete focused tweet.                      | `delete-status`    |
| `enter`  | Open tweet form to reply to focused tweet. | `reply`            |
| `escape` | Unfocus current item.                      | `unfocus`          |

### Tweet Form

These shortcuts are applied when tweet form is opened.  Global shortcuts will be disabled while tweet form is opened.

| Default      | Description                                        | Action Name              |
|--------------|----------------------------------------------------|--------------------------|
| `ctrl+enter` | Send tweet.                                        | `send-tweet`             |
| `enter`      | If completion item is focused, select it.          | `choose-suggestion`      |
| `tab`        | If completion started, select next completion item | `select-next-suggestion` |
| `escape`     | Close text form.                                   | `close-editor`           |
| `ctrl+g`     | Close current auto completion.                     | `cancel-suggestion`      |

### Media Preview

These shortcuts are applied when preview of pictures in tweet is opened.  Global shortctus will be disabled while the preview is opened.

| Defult                | Description                       | Action Name        |
|-----------------------|-----------------------------------|--------------------|
| `j` or `l` or `right` | Show next picture in preview.     | `next-picture`     |
| `k` or `h` or `left`  | Show previous picture in preview. | `previous-picture` |
| `escape` or `x`       | Close preview.                    | `close-preview`    |

### Drawner Timeline

| Default         | Description                                | Action Name        |
|-----------------|--------------------------------------------|--------------------|
| `tab`           | Open tweet form.                           | `open-tweet-form`  |
| `i`             | Move focus to top.                         | `focus-top`        |
| `j`             | Move focus to next.                        | `focus-next`       |
| `k`             | Move focus to previous.                    | `focus-previous`   |
| `m`             | Move focus to bottom.                      | `focus-bottom`     |
| `o`             | Open picture preview in focused tweet.     | `open-media`       |
| `O`             | Open focused tweet page in browser.        | `open-status-page` |
| `l`             | Open all links in focused tweet.           | `open-links`       |
| `ctrl+r`        | Retweet focused tweet.                     | `retweet`          |
| `ctrl+f`        | Like focused tweet.                        | `like`             |
| `ctrl+D`        | Delete focused tweet.                      | `delete-status`    |
| `enter`         | Open tweet form to reply to focused tweet. | `reply`            |
| `escape` or `x` | Back to main timeline                      | `close`            |

## JSON Configuration File

You can put `config.json` in the application directory.  You can configure this app with it.  Properties of the json are below:

### `expand_tweet`

It controls tweets in timeline should be expanded or not.  Value can be one of `"always"`, `"focused"` and `"never"`.  If `"always"`, all tweets are expanded.  If `"focused"`, only focused tweet is expanded and others are collapsed.  If `"never"`, all tweets are collapsed.

Collapsed tweet is displayed in one line (when it has quote, it will be two lines) and many things in tweet will be simplified.

Default value is `"always"`.


### `notification`

Enable/Disable notification from app.

When you specify boolean value, all notifications are enabled/disabled.  (Disabled if `false`).

When you want to enable/disable each kind of notification, you can specify an object value.  It can contain `reply`, `retweet`, `like` and `quoted` properties.  Corresponding values of the properties must be boolean type.

The default value is `true`.

### `notification_sound`

This option can be `boolean` or `string`.

When `boolean` value is specified, it represents to enable/disable sound on notification.  If `true`, it means 'enabled'. Default notification sound is used.

When `string` value is specified, it represents the sound of notification.  Kind of sound is the same value as [HTML5 Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notification/sound).

The default value is `false`. Notification sound is enabled and system default notification sound is used.

### `mute`

Show/Dismiss muted/blocked tweets in each timelines.

When you specify boolean value, muted/blocked tweets are shown/dismissed in all timelines.  When `true` is specified, they will be displayed.

When you want to control muted/blocked tweets in each timeline, you can specify an object value as well as `notification` property.  It can contain `home` and `mention` properties.  Corresponding values of properties must be boolean type.  For example, `"home": true` will dismiss muted/blocked tweets on home timeline.

The default value is `{"home": true, "mention": false}`.

### `hotkey_accelerator`

Global hot key to access to YourFukurou instantly from everywhere.
The value is called 'accelerator'.  Please note that the format is different from below `keymaps` configuration.  The format is described [here](https://github.com/electron/electron/blob/master/docs/api/accelerator.md).
For example `CmrOrCtrl+.` represents 'Ctrl' (in OS X, 'Command') modifier and dot key.

When the hot key is pressed, app window is toggled.  When window is not focused, app will be focused.  Otherwise, app will be hidden.

### `keymaps`

Coming soon.

### `proxy`

host + port number joined with ':' such as 'example.com:80080'.  When `null` is set, `$https_proxy` environment variable will be used.

### `sticky_mode`

If this value is set to `true`, window will be in 'sticky' mode.  Window will be shown in **every** workspace and hidden on other window focused.  This mode is intended to be used with `hotkey_accelerator` configuration.  You can toggle YourFukurou window with global shortcut like Alfred app.

### `max_timeline_items`

If some number value is specified, number of items in timeline is limited to the number.  If you follow so many users and you feel updating timeline consumes too much CPU power, please limit the number of items in timeline.  In most cases, you need not to specify this value and can leave this value as `null`.

### Example of `config.json`:

```json
{
  "notification": {
    "reply": true,
    "retweet": false,
    "like": false,
    "quoted": true
  },
  "hotkey_accelerator": "CmrOrCtrl+`",
  "expand_tweet": "focused",
  "mute": {
    "home": true,
    "mention": true
  },
  "proxy": "example.com:80080",
  "sticky_mode": true,
  "plugin": [
    "my-plugin.js"
  ]
}
```


## Screenshots

### Timeline

| `expand_tweet=always` (default) | `expand_tweet=focused` |
|---------------------------------|------------------------|
| ![full view](https://raw.githubusercontent.com/rhysd/ss/master/YourFukurou/full-view.png) | ![mini view](https://raw.githubusercontent.com/rhysd/ss/master/YourFukurou/mini-view.png) |

### Mentions and Activities

| `expand_tweet=always` (default) | `expand_tweet=focused` |
|---------------------------------|------------------------|
| ![full view](https://raw.githubusercontent.com/rhysd/ss/master/YourFukurou/activity_full.png) | ![mini view](https://raw.githubusercontent.com/rhysd/ss/master/YourFukurou/activity_mini.png) |

### User Profile Popup and Drawer Timeline

![user profile popup and drawer timeline](https://raw.githubusercontent.com/rhysd/ss/master/YourFukurou/user-popup-and-drawer-timeline.gif)

### Tweet Form

![tweet form](https://raw.githubusercontent.com/rhysd/ss/master/YourFukurou/tweet-form.png)

### Reply Form

![reply form](https://github.com/rhysd/ss/blob/master/YourFukurou/reply-form.png)

### Screen Name Completion

![completion](https://raw.githubusercontent.com/rhysd/ss/master/YourFukurou/completion.png)


## Plugin

Plugin is a Node.js module.  User specifies the path to it with `config.json` configuration file.  The module will be loaded using `require()` in application.

Plugin must export one object to `export.plugin` which is defined as below:

```typescript
interface Plugin {
    // Note:
    // Filter function takes an item and returns boolean value:
    //   `true` if the item should *remain*
    //   `false` if the item should NOT *remain*
    filter?: {
        home_timeline?: (tw: Tweet, timeline: TimelineState) => boolean;
        mention_timeline?: (tw: Tweet, timeline: TimelineState) => boolean;
        tweet_notification?: (tw: Tweet) => boolean;
        like_notification?: (tw: Tweet, by_user: TwitterUser) => boolean;
    };
}
```

`Tweet` is defined [here](./renderer/item/tweet.ts) and `TimelineState` is defined [here](states/timeline.ts).  You can gain raw json value of the tweet with `tweet.json` property.

Below is a single file example.

```javascript
const RE_FUCK = /\bfuck\b/i;

function filterHomeTimeline(tweet, timeline) {
    if (tweet.user.screen_name === 'Linda_pp') {
        // When screen name is '@Linda_pp', do not show it in home timeline
        return false;
    }

    if (RE_FUCK.test(tweet.text)) {
        // When tweet text includes 'fuck', do not show it in home timeline
        return false;
    }

    return true;
}

// Export as npm module
exports.plugin = {
    filter: {
        home_timeline: filterHomeTimeline
    }
};
```

## For Development

```sh
$ git clone https://github.com/rhysd/YourFukurou.git
$ cd YourFukurou
$ npm run dep
$ npm run build

# Run app in production
$ npm run app

# Run app with debug log and DevTools
$ npm run debug

# Run app with dummy tweets.  {data dir}/tweets.json should exist.
$ npm run dummy
```

