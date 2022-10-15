import React from 'react';
import ga4 from 'react-ga4';
import Errors from './errors.json';
import { MantineProvider, Text, TextInput, createStyles, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { useDebouncedValue, useInputState, useLocalStorage } from '@mantine/hooks';
import Table from './components/Table/Table';
import { Footer } from './components/Footer/Footer';

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const gaId = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
  if (typeof gaId === 'string') {
    ga4.initialize(gaId);
  }
}

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'dark',
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme: colorScheme }} withNormalizeCSS withGlobalStyles>
        <Body />
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

const useStyles = createStyles((theme, params, getRef) => ({
  container: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    gridTemplateColumns: '100%',
    minHeight: '100vh',
  },

  header: {
    marginLeft: theme.spacing.xl,
    marginRight: theme.spacing.xl,
  },

  headertitle: {
    fontFamily: '"Nixie One", cursive',
  },

  main: {
    marginLeft: theme.spacing.xl,
    marginRight: theme.spacing.xl,
  },

  textInput: {
    marginBottom: theme.spacing.xl,
  }
}));

function Body() {
  const {classes, cx} = useStyles();
  const [value, setValue] = useInputState('');
  const [debounced] = useDebouncedValue(value, 300);

  const errors = Errors.errors as any;

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1 className={classes.headertitle}>Cocoa Errors</h1>
      </header>
      <main className={classes.main}>
        <TextInput
          className={classes.textInput} placeholder="type domain..."
          onChange={setValue}
        />
        <Table data={errors} filterText={value}></Table>
      </main>
      <Footer></Footer>
    </div>
  );
}

export default App;
