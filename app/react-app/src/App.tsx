import React from 'react';
import Errors from './errors.json';
import './App.css';
import { MantineProvider, Text, TextInput } from '@mantine/core';
import { useDebouncedValue, useInputState } from '@mantine/hooks';
import Table from './components/Table';

function App() {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withNormalizeCSS withGlobalStyles>
      <Content />
    </MantineProvider>
  )
}

function Content() {
  const errors = Errors.errors as any;

  return (
    <main>
      <h1 className='title'>Cocoa Errors</h1>
      <Table data={errors}></Table>
    </main>
  );
}

export default App;
