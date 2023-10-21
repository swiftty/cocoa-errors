import React from 'react';
import ga4 from 'react-ga4';
import '@mantine/core/styles.css';
import Errors from './errors.json';
import { MantineProvider, TextInput, useMantineColorScheme } from '@mantine/core';
import { useDebouncedValue, useInputState, useLocalStorage } from '@mantine/hooks';
import Table from './components/Table/Table';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import classes from './App.module.css';

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const gaId = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
  if (typeof gaId === 'string') {
    ga4.initialize(gaId);
  }
}

function App() {
  return (
    <MantineProvider defaultColorScheme={'dark'} withCssVariables>
      <Body />
    </MantineProvider>
  )
}

function Body() {
  const [value, setValue] = useInputState('');
  const [debounced] = useDebouncedValue(value, 300);

  const errors = Errors.errors as any;

  return (
    <div className={classes.container}>
      <Header></Header>
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
