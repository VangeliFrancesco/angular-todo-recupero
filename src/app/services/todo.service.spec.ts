import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TodoService, errorMessage } from './todo.service';

describe('TodoService e API REST', () => {
  let service: TodoService;
  let http: HttpTestingController;
  const url = 'https://jsonplaceholder.typicode.com/todos';
  const todo = { id: 1, userId: 1, title: 'Studiare Angular', completed: false };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TodoService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('legge l’elenco e conclude il caricamento', () => {
    service.loadAll().subscribe();
    expect(service.loading()).toBe(true);
    http.expectOne({ url, method: 'GET' }).flush([todo]);
    expect(service.todos()).toEqual([todo]);
    expect(service.loading()).toBe(false);
  });

  it('legge il singolo elemento', () => {
    service.loadOne(1).subscribe();
    http.expectOne(`${url}/1`).flush(todo);
    expect(service.selected()).toEqual(todo);
  });

  it('distingue il 404 e cancella il vecchio dettaglio', () => {
    service.loadOne(1).subscribe();
    http.expectOne(`${url}/1`).flush(todo);
    service.loadOne(999).subscribe({ error: () => {} });
    expect(service.selected()).toBeNull();
    http.expectOne(`${url}/999`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(service.error()).toContain('404');
    expect(service.loading()).toBe(false);
  });

  it('distingue lo stato 0 e permette di riprovare', () => {
    service.loadAll().subscribe({ error: () => {} });
    http.expectOne(url).error(new ProgressEvent('error'));
    expect(service.error()).toContain('stato 0');
    expect(service.loading()).toBe(false);
    service.loadAll().subscribe();
    expect(service.error()).toBeNull();
    http.expectOne(url).flush([todo]);
    expect(service.todos()).toEqual([todo]);
  });

  it('crea due attività distinte e apre il dettaglio locale senza una GET inesistente', () => {
    const { id, ...payload } = todo;
    for (let index = 0; index < 2; index++) {
      service.create(payload).subscribe(created => expect(created.id).toBe(201 + index));
      const req = http.expectOne({ url, method: 'POST' });
      expect(req.request.body).toEqual(payload);
      req.flush({ ...payload, id: 201 });
    }
    expect(service.todos().map(item => item.id)).toEqual([201, 202]);
    service.loadOne(202).subscribe();
    http.expectNone(`${url}/202`);
    expect(service.selected()?.id).toBe(202);
    service.loadAll().subscribe();
    http.expectOne(url).flush([todo]);
    expect(service.todos().map(item => item.id)).toEqual([1, 201, 202]);
  });

  it('un POST fallito non aggiunge attività e non lascia il pulsante in salvataggio', () => {
    service.create({ title: 'Nuova', userId: 1, completed: false }).subscribe({ error: () => {} });
    expect(service.saving()).toBe(true);
    http.expectOne(url).error(new ProgressEvent('error'));
    expect(service.todos()).toEqual([]);
    expect(service.saveError()).toContain('stato 0');
    expect(service.saving()).toBe(false);
  });

  it('annullare una richiesta termina il caricamento', () => {
    const subscription = service.loadOne(1).subscribe();
    const req = http.expectOne(`${url}/1`);
    subscription.unsubscribe();
    expect(req.cancelled).toBe(true);
    expect(service.loading()).toBe(false);
  });

  it('gli altri errori hanno un messaggio generale', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 500 }))).toContain('servizio');
  });
});
