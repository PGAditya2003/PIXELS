// theme.js
import { extendTheme } from "@chakra-ui/react";

const config = {
    initialColorMode: 'dark',     // 👈 set your preferred default mode
    useSystemColorMode: false,    // 👈 disables system color preference
  };

const theme = extendTheme({ config });

export default theme;
