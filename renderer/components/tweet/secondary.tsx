import * as React from 'react';

interface TweetSecondaryProps extends React.Props<any> {
    status: TweetStatus;
}

const TweetSecondary = (props: TweetSecondaryProps) => (
    <div className="tweet__secondary">
        TODO: Secondary
    </div>
);
export default TweetSecondary;
