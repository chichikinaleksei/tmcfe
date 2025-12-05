import { useState } from "react";
import { TextInput, Button, Group } from "@mantine/core";
import { selectionChanged } from "../events";
import { notifications } from "@mantine/notifications";

const API_URL = import.meta.env.VITE_API_URL;

export function NewItemForm() {
  const [value, setValue] = useState("");

  async function handleAdd() {
    const numericId = Number(value.trim());

    if (!numericId || numericId <= 0) {
      notifications.show({
        title: "Invalid ID",
        message: "ID must be a positive number.",
        color: "red",
      });
      return;
    }

    const resp = await fetch(`${API_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: numericId }),
    });

    if (resp.status === 409) {
      notifications.show({
        title: "ID already exists",
        message: `ID ${numericId} is already in the system.`,
        color: "red",
      });
      return;
    }

    if (!resp.ok) {
      notifications.show({
        title: "Error",
        message: "Server rejected this ID.",
        color: "red",
      });
      return;
    }

    setValue("");

    notifications.show({
      title: "ID accepted",
      message: `ID ${numericId} will be added within ~10 seconds`,
      color: "blue",
    });

    setTimeout(() => {
      selectionChanged.emit();
      notifications.show({
        title: "Updated",
        message: `New elements were added`,
        color: "teal",
      });
    }, 10500);
  }


  return (
    <Group align="end" spacing="xs">
      <TextInput
        label="Add new ID"
        placeholder="Enter any number"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
      <Button onClick={handleAdd}>Add</Button>
    </Group>
  );
}
