export interface Todo {
  readonly userId: number;
  readonly id: number;
  readonly title: string;
  readonly completed: boolean;
}

export type NewTodo = Omit<Todo, 'id'>;
