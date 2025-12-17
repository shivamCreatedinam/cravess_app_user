import React, { ReactNode } from 'react';

interface WrapperProps {
    children: ReactNode;
    loadSplash?: (value: boolean) => void;
    dataDogConfig?: any;
}

const AppInitializer: React.FC<WrapperProps> = ({ children }) => {
    return <>{children}</>;
};

export default AppInitializer;
