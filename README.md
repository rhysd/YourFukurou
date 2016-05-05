<img src="images/icon.png" width="70"/>Hackable [YoruFukurou](https://sites.google.com/site/yorufukurou/home-en) Alternative
=====================================================================================

This is a Twitter client to aim to replace YoruFukurou with high pluggablity.

Goals :bird::

- Perspicuity
  - Display as many tweets on timeline as possible
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

## JSON Configuration File

You can put `config.json` in the application directory.  You can configure this app with it.  Properties of the json are below:

### `notification`

Enable/Disable notification from app.

When you specify boolean value, all notifications are enabled/disabled.  (Disabled if `false`).

When you want to enable/disable each kind of notification, you can specify an object value.  It can contain `reply`, `retweet` and `quoted` properties.  Corresponding values of the properties must be boolean type.

The default value is `true`.

### `mute`

Show/Dismiss muted/blocked tweets in each timelines.

When you specify boolean value, muted/blocked tweets are shown/dismissed in all timelines.  When `true` is specified, they will be displayed.

When you want to constrol muted/blocked tweets in each timeline, you can specify an object value as well as `notification` property.  It can contain `home` and `mention` properties.  Corresponding values of properties must be boolean type.  For example, `"home": true` will dismiss muted/blocked tweets on home timeline.

The default value is `{"home": true, "mention": false}`.

### Example of `config.json`:

```json
{
  "notification": {
    "reply": true,
    "retweet": false,
    "quoted": true
  },
  "mute": {
    "home": true,
    "mention": true
  },
  "plugin": [
    "my-plugin.js"
  ]
}
```

## Plugin

Plugin is a Node.js module.  User specifies the path to it with `config.json` configuration file.  The module will be loaded using `require()` in application.

Plugin must export one object defined as below:

```typescript
interface Plugin {
    // Note:
    // Filter function takes an item and returns boolean value:
    //   `true` if the item should *remain*
    //   `false` if the item should NOT *remain*
    filter?: {
        home_timeline?: (tw: Tweet, timeline: TimelineState) => boolean;
        mention_timeline?: (tw: Tweet, timeline: TimelineState) => boolean;
        notification?: (tw: Tweet) => boolean;
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
module.exports = {
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

## Credits

Icon image was made by [Freepik](http://www.freepik.com) and is licensed by [Creative Commons BY 3.0](http://creativecommons.org/licenses/by/3.0/).

