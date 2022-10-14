import { createStyles } from '@mantine/core';

export default createStyles((theme, params, getRef) => ({
  domain: {
    fontWeight: 600,
    fontSize: theme.fontSizes.md
  },
  domainSub: {
    fontSize: theme.fontSizes.xs,
    marginLeft: theme.spacing.xs,
    color: theme.colorScheme == 'dark' ? theme.colors.dark[2] : theme.colors.gray[7],
  },
  pre: {
    '&::before': {
      content: '"`"',
    },
    '&::after': {
      content: '"`"',
    },
    backgroundColor: theme.colorScheme == 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
    borderRadius: theme.radius.xs,
    padding: theme.spacing.xs / 2,
  },
  code: {
    fontSize: theme.fontSizes.md,
    textAlign: 'right'
  },
  codeSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colorScheme == 'dark' ? theme.colors.dark[2] : theme.colors.gray[7],
    textAlign: 'right'
  }
}));