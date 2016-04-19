type ChannelFromMain
    = 'yf:tweet'
    | 'yf:retweet-success'
    | 'yf:unretweet-success'
    | 'yf:like-success'
    | 'yf:unlike-success'
    | 'yf:account'
    | 'yf:api-failure'
    | 'yf:connection-failure'
    | 'yf:friends';

type ChannelFromRenderer
    = 'yf:request-retweet'
    | 'yf:undo-retweet'
    | 'yf:request-like'
    | 'yf:destroy-like';
