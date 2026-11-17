import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './todo-list.html',
})
export class TodoList {
  readonly service = inject(TodoService);
  private readonly destroyRef = inject(DestroyRef);
  readonly query = signal('');
  readonly status = signal('all');
  readonly showForm = signal(false);
  readonly success = signal(false);
  title = '';
  userId = 1;
  completed = false;

  readonly total = computed(() => this.service.todos().length);
  readonly completedCount = computed(() => this.service.todos().filter(todo => todo.completed).length);
  readonly pendingCount = computed(() => this.total() - this.completedCount());
  readonly filtered = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return this.service.todos().filter(todo =>
      todo.title.toLocaleLowerCase().includes(query) &&
      (this.status() === 'all' || todo.completed === (this.status() === 'done')),
    );
  });

  constructor() { this.reload(); }

  reload(): void {
    this.service.loadAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ error: () => {} });
  }

  create(form: NgForm): void {
    if (form.invalid || !this.title.trim() || this.service.saving()) return;
    this.success.set(false);
    this.service.create({ title: this.title.trim(), userId: this.userId, completed: this.completed })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          form.resetForm({ title: '', userId: 1, completed: false });
          this.query.set('');
          this.status.set('all');
          this.success.set(true);
          this.showForm.set(false);
        },
        error: () => {},
      });
  }
}
