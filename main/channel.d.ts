type ChannelFromMain
    = 'yf:tweet'
    | 'yf:mentions'
    | 'yf:retweet-success'
    | 'yf:unretweet-success'
    | 'yf:like-success'
    | 'yf:unlike-success'
    | 'yf:update-status-success'
    | 'yf:my-account'
    | 'yf:delete-status'
    | 'yf:api-failure'
    | 'yf:connection-failure'
    | 'yf:friends';

type ChannelFromRenderer
    = 'yf:request-retweet'
    | 'yf:undo-retweet'
    | 'yf:request-like'
    | 'yf:destroy-like'
    | 'yf:update-status'
    | 'yf:destroy-status'
;
