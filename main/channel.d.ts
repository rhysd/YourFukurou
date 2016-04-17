type ChannelFromMain
    = 'yf:tweet'
    | 'yf:retweet-success'
    | 'yf:unretweet-success'
    | 'yf:api-failure'
    | 'yf:connection-failure'
    | 'yf:friends';

type ChannelFromRenderer
    = 'yf:request-retweet'
    | 'yf:undo-retweet';
