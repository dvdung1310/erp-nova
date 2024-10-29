import React from 'react';
import { useParams } from 'react-router-dom';

const Recruit_candidates = () => {
    const { news_id } = useParams(); // Get the news_id from the URL

    return (
        <div>
            <h1>Department Team</h1>
            <p>Department ID: {news_id}</p> {/* Display the department ID */}
        </div>
    );
};

export default Recruit_candidates;