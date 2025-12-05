type Listener = () => void;

class Emitter {
  private listeners: Listener[] = [];

  emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

// Эмиттер, который будет говорить "выбор изменился"
export const selectionChanged = new Emitter();
export const reorderApplied = new Emitter();
