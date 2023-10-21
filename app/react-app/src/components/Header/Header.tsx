import { Text } from '@mantine/core';
import Errors from '../../errors.json';
import classes from './Header.module.css';

export function Header() {
  const version = Errors.version;

  return (
    <header className={classes.header}>
      <h1 className={classes.headertitle}>Cocoa Errors</h1>
      <div className={classes.versionContainer}>
        <Text className={classes.version}>Xcode: {version.xcode} ({version.build})</Text>
      </div>
    </header>
  )
}