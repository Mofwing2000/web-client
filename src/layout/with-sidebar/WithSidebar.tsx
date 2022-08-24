import React from 'react';
import { useParams } from 'react-router-dom';

const WithSidebar = () => {
    const { type } = useParams();

    return (
        <>
            <div>WithSidebar</div>
        </>
    );
};

export default WithSidebar;
