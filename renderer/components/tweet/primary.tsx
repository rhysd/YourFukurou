import * as React from 'react';

interface TweetPrimaryProps extends React.Props<any> {
    status: TweetStatus;
}

const TweetPrimary = (props: TweetPrimaryProps) => (
    <div className="tweet__primary">
        TODO: Primary
    </div>
);
export default TweetPrimary;
