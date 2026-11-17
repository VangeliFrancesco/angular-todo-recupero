import { Component, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, switchMap } from 'rxjs';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-todo-detail',
  imports: [RouterLink],
  template: `
    <a class="back" routerLink="/todos">← Tutte le attività</a>
    <section class="detail panel" [attr.aria-busy]="service.loading()">
      <p class="eyebrow">UNO SGUARDO PIÙ DA VICINO</p>
      @if (service.loading()) {
        <div class="empty" role="status"><span class="spinner"></span> Caricamento dell’attività…</div>
      } @else if (service.error()) {
        <h1>Qualcosa non va.</h1><p class="error" role="alert">{{ service.error() }}</p><button class="secondary" (click)="retry()">Riprova</button>
      } @else if (service.selected(); as todo) {
        <div class="detail-meta"><span>ATTIVITÀ #{{ todo.id }}</span><span class="badge" [class.done]="todo.completed">{{ todo.completed ? 'Completata' : 'Da completare' }}</span></div>
        <h1>{{ todo.title }}</h1>
        <p class="muted">Assegnata all’utente {{ todo.userId }}</p>
        @if (todo.id > 200) { <p class="notice">Creata in questa sessione. JSONPlaceholder non salva le nuove attività sul server.</p> }
        <nav class="detail-nav" aria-label="Navigazione tra le attività">
          @if (todo.id > 1) { <a class="secondary" [routerLink]="['/todos', todo.id - 1]">← Precedente</a> } @else { <button class="secondary" disabled>← Precedente</button> }
          @if (todo.id < lastId()) { <a class="primary" [routerLink]="['/todos', todo.id + 1]">Successivo →</a> } @else { <button class="primary" disabled>Successivo →</button> }
        </nav>
      }
    </section>
  `,
})
export class TodoDetail {
  readonly service = inject(TodoService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly lastId = computed(() => Math.max(200, ...this.service.todos().map(todo => todo.id)));

  constructor() {
    this.route.paramMap.pipe(
      // switchMap annulla la vecchia richiesta quando cambia l'ID.
      switchMap(params => this.service.loadOne(this.readId(params.get('id'))).pipe(catchError(() => EMPTY))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  retry(): void {
    this.service.loadOne(this.readId(this.route.snapshot.paramMap.get('id')))
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ error: () => {} });
  }

  private readId(value: string | null): number {
    // Gli ID malformati vengono diretti a una risorsa inesistente.
    return value && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : 0;
  }
}
