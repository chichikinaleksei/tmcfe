import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@mantine/core";

type Props = {
  id: number;
};

export function SortableItem({ id }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: "100%",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Button
        variant="filled"
        color="teal"
        fullWidth
        {...attributes}
        {...listeners}
      >
        ID: {id}
      </Button>
    </div>
  );
}
