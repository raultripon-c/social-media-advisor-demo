import React, { createContext, useContext, useState, ReactNode } from "react";

interface SubPathContextType {
  subPath: string;
  setSubPath: (subPath: string) => void;
}

const SubPathContext = createContext<SubPathContextType>({
  subPath: "",
  setSubPath: () => {},
});

export const SubPathProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [subPath, setSubPath] = useState<string>("");

  return (
    <SubPathContext.Provider value={{ subPath, setSubPath }}>
      {children}
    </SubPathContext.Provider>
  );
};

export const useSubPath = (): SubPathContextType => useContext(SubPathContext);
