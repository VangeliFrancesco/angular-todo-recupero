import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  template: `
    <header class="site-header"><a class="brand" routerLink="/todos"><span class="brand-mark">✓</span> Todo<span>Lab</span></a><span class="header-note">ANGULAR / REST API</span></header>
    <main id="main"><router-outlet /></main>
    <footer>Todo Lab <span>Progetto di gruppo · JSONPlaceholder</span></footer>
  `,
})
export class App {}
