import { Text, createStyles, Group, Space } from '@mantine/core';
import Errors from '../../errors.json';

const useStyles = createStyles((theme, params, getRef) => ({
  header: {
    marginLeft: theme.spacing.xl,
    marginRight: theme.spacing.xl,

    display: 'grid',
    gridTemplateColumns: '1fr auto',
  },

  headertitle: {
    fontFamily: '"Nixie One", cursive',
  },

  versionContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    paddingBottom: theme.spacing.xs,
  },

  version: {
    fontSize: theme.fontSizes.xs,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[7],
  }
}));

export function Header() {
  const {classes, cx} = useStyles();
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