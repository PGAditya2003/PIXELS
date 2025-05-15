// theme.js
import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "dark", // or "light" if that’s your intended mode
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

export default theme;
