import React from 'react';
import Errors from './errors.json';
import './App.css';
import { MantineProvider, Text, TextInput, createStyles } from '@mantine/core';
import { useDebouncedValue, useInputState } from '@mantine/hooks';
import Table from './components/Table/Table';
import { Footer } from './components/Footer/Footer';

function App() {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withNormalizeCSS withGlobalStyles>
      <Body />
    </MantineProvider>
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
        <h1 className='title'>Cocoa Errors</h1>
      </header>
      <main className={classes.main}>
        <TextInput
          className={classes.textInput} placeholder="type domain..."
          onChange={setValue}
        />
        <Table data={errors} filterText={value}></Table>
      </main>
      <footer>
        <Footer></Footer>
      </footer>
    </div>
  );
}

export default App;
