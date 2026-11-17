import { Routes } from '@angular/router';
import { TodoList } from './pages/todo-list';
import { TodoDetail } from './pages/todo-detail';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'todos' },
  { path: 'todos', component: TodoList, title: 'Attività · Todo Lab' },
  { path: 'todos/:id', component: TodoDetail, title: 'Dettaglio · Todo Lab' },
  { path: '**', redirectTo: 'todos' },
];
