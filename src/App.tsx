import { Container, Grid, Title, Paper, Stack } from '@mantine/core';
import { LeftList } from './components/LeftList';
import { RightList } from './components/RightList';
import { NewItemForm } from './components/NewItemForm';

export default function App() {
  return (
    <Container size="xl" style={{ marginTop: 30 }}>
      <Stack spacing="lg">
        <Title order={2} align="center">
          Dual List with Infinite Scroll & Drag/Drop
        </Title>

        <NewItemForm />

        <Grid gutter="lg">
          {/* LEFT LIST */}
          <Grid.Col span={6}>
            <Paper shadow="sm" p="md" withBorder h="80vh" style={{ overflow: 'hidden' }}>
              <Title order={4} mb="md">Available items</Title>
              <LeftList />
            </Paper>
          </Grid.Col>

          {/* RIGHT LIST */}
          <Grid.Col span={6}>
            <Paper shadow="sm" p="md" withBorder h="80vh" style={{ overflow: 'hidden' }}>
              <Title order={4} mb="md">Selected items</Title>
              <RightList />
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
