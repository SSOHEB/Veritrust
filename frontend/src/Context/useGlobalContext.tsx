import { useContext } from "react";
import { GlobalContext } from "./GlobalContextExport";

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
