import { createStyles, Group, Anchor, ActionIcon, Space } from '@mantine/core';
import { IconBrandTwitter } from '@tabler/icons-react';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: 120,
    borderTop: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,

    padding: theme.spacing.xs
  },
}));

interface FooterSimpleProps {
  links?: { link: string; label: string }[];
}

export function Footer({ links }: FooterSimpleProps) {
  const { classes } = useStyles();
  const items = links?.map((link) => (
    <Anchor<'a'>
      color="dimmed"
      key={link.label}
      href={link.link}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <footer>
      <div className={classes.footer}>
        <Group position='right'>
          <ActionIcon size="lg" component='a' href='https://twitter.com/_swiftty' target='_blank'>
            <IconBrandTwitter size={18} stroke={1.5} />
          </ActionIcon>
          <Space w='xl'></Space>
          <ThemeToggle></ThemeToggle>
        </Group>
      </div>
    </footer>
  );
}