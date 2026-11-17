import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, defer, finalize, map, of, tap, throwError } from 'rxjs';
import { NewTodo, Todo } from '../models/todo';

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 404) return 'Attività inesistente (404). Controlla l’indirizzo o torna all’elenco.';
    if (error.status === 0) return 'Rete non disponibile (stato 0). Controlla la connessione e riprova.';
  }
  return 'Il servizio non è disponibile al momento. Riprova tra poco.';
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly url = 'https://jsonplaceholder.typicode.com/todos';
  private readonly _todos = signal<readonly Todo[]>([]);
  private readonly _selected = signal<Todo | null>(null);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _saveError = signal<string | null>(null);
  // JSONPlaceholder non salva i POST: manteniamo i nuovi todo nella sessione.
  private readonly localTodos = new Map<number, Todo>();
  private nextLocalId = 201;

  readonly todos = this._todos.asReadonly();
  readonly selected = this._selected.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();
  readonly saveError = this._saveError.asReadonly();

  loadAll(): Observable<readonly Todo[]> {
    return defer(() => {
      this._loading.set(true);
      this._error.set(null);
      return this.http.get<readonly Todo[]>(this.url).pipe(
        tap(todos => this._todos.set([...todos, ...this.localTodos.values()])),
        catchError(error => this.fail(error)),
        finalize(() => this._loading.set(false)),
      );
    });
  }

  loadOne(id: number): Observable<Todo> {
    return defer(() => {
      this._selected.set(null);
      this._error.set(null);
      this._loading.set(true);
      const local = this.localTodos.get(id);
      const request = local ? of(local) : this.http.get<Todo>(`${this.url}/${id}`);
      return request.pipe(
        tap(todo => this._selected.set(todo)),
        catchError(error => this.fail(error)),
        finalize(() => this._loading.set(false)),
      );
    });
  }

  create(todo: NewTodo): Observable<Todo> {
    return defer(() => {
      this._saving.set(true);
      this._saveError.set(null);
      return this.http.post<Todo>(this.url, todo).pipe(
        // L'API restituisce sempre 201: assegniamo ID locali distinti.
        map(response => ({ ...response, id: this.nextLocalId++ })),
        tap(created => {
          this.localTodos.set(created.id, created);
          this._todos.update(todos => [...todos, created]);
        }),
        catchError(error => {
          this._saveError.set(errorMessage(error));
          return throwError(() => error);
        }),
        finalize(() => this._saving.set(false)),
      );
    });
  }

  private fail(error: unknown): Observable<never> {
    this._error.set(errorMessage(error));
    return throwError(() => error);
  }
}
