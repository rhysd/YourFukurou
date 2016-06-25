type ChannelFromMain
    = 'yf:tweet'
    | 'yf:my-account-update'
    | 'yf:delete-status'
    | 'yf:liked-status'
    | 'yf:follow'
    | 'yf:unfollow'
    | 'yf:connection-failure'
    | 'yf:rejected-ids'
    | 'yf:unrejected-ids'
    | 'yf:friends'
    | 'yf:auth-tokens'
    | 'yf:api-failure'
;

type ChannelFromRenderer = 'yf:start-user-stream';
