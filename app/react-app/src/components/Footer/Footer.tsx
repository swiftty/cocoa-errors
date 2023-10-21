import { Group, Anchor, ActionIcon, Space } from '@mantine/core';
import { IconBrandX } from '@tabler/icons-react';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import classes from './Footer.module.css';

interface FooterSimpleProps {
  links?: { link: string; label: string }[];
}

export function Footer({ links }: FooterSimpleProps) {
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
        <Group gap="xl" justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" component='a' href='https://twitter.com/_swiftty' target='_blank'>
            <IconBrandX size={18} stroke={1.5} />
          </ActionIcon>
          <ThemeToggle></ThemeToggle>
        </Group>
      </div>
    </footer>
  );
}