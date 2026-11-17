import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { TodoService } from '../services/todo.service';
import { TodoList } from './todo-list';

describe('Pagine e navigazione', () => {
  let http: HttpTestingController;
  const url = 'https://jsonplaceholder.typicode.com/todos';
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('ricalcola conteggi e filtro combinato', () => {
    const fixture = TestBed.createComponent(TodoList);
    http.expectOne(url).flush([
      { id: 1, userId: 1, title: 'Studiare Angular', completed: false },
      { id: 2, userId: 1, title: 'Studiare HTTP', completed: true },
    ]);
    const page = fixture.componentInstance;
    expect(page.total()).toBe(2);
    expect(page.completedCount()).toBe(1);
    expect(page.pendingCount()).toBe(1);
    page.query.set('STUDIARE');
    page.status.set('done');
    expect(page.filtered().map(todo => todo.id)).toEqual([2]);
    page.query.set('inesistente');
    expect(page.filtered()).toEqual([]);
    fixture.destroy();
  });

  it('cambia dettaglio sulla stessa route e recupera dopo un 404', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/todos/1');
    http.expectOne(`${url}/1`).flush({ id: 1, userId: 1, title: 'Prima attività', completed: false });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Prima attività');
    expect(harness.routeNativeElement?.querySelector('button[disabled]')?.textContent).toContain('Precedente');
    await harness.navigateByUrl('/todos/999');
    http.expectOne(`${url}/999`).flush({}, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('404');
    await harness.navigateByUrl('/todos/200');
    http.expectOne(`${url}/200`).flush({ id: 200, userId: 10, title: 'Ultima attività', completed: true });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Ultima attività');
    expect(harness.routeNativeElement?.querySelector('button[disabled]')?.textContent).toContain('Successivo');
    expect(TestBed.inject(TodoService).loading()).toBe(false);
  });
});
